# bot.py
import asyncio
import logging
from aiohttp import web
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

# =============== CONFIG ===============
BOT_TOKEN = "8280370388:AAGjrOXHT7ejFjScjtqD-GJIaKy1RKAn26c"  # o'zgartiring
ADMIN_ID = 1115076314  # o'zgartiring
SPREADSHEET_ID = "18mLwn6i26dgKLaNE2lKvI88I_pANjQlm3rjaWQm_lnQ"  # o'zgartiring
ALLOWED_USERS = {ADMIN_ID: "Admin"}  # {user_id: username}

# =============== LOGGING ===============
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============== GOOGLE SHEETS SETUP ===============
sheet = None
try:
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive"
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name("service_account.json", scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SPREADSHEET_ID).sheet1
    logger.info("Google Sheets connected (sheet1).")
except Exception as e:
    logger.exception("Google Sheets connection failed: %s", e)
    sheet = None  # server hali ishlaydi, ammo sheet None bo'lishi mumkin

# =============== TELEGRAM BOT SETUP ===============
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# ---------------- /start ----------------
@dp.message(Command("start"))
async def start(message: types.Message):
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.full_name or "Unknown"

    # Agar ruxsat mavjud bo'lsa username yangilaymiz
    if user_id in ALLOWED_USERS:
        ALLOWED_USERS[user_id] = username
        await message.answer("✅ Xush kelibsiz! Siz botdan foydalana olasiz.")
    else:
        await message.answer("❌ Siz ruxsat olmagansiz. Admin bilan bog'laning.")

# ---------------- /allow ----------------
@dp.message(Command("allow"))
async def allow_user(message: types.Message):
    if message.from_user.id != ADMIN_ID:
        return

    args = message.text.split()
    if len(args) != 2 or not args[1].isdigit():
        await message.reply("❌ Foydalanuvchi ID kiriting: /allow <chat_id>")
        return

    user_id = int(args[1])
    if user_id not in ALLOWED_USERS:
        ALLOWED_USERS[user_id] = "Unknown"
        await message.reply(f"✅ Foydalanuvchi {user_id} ga ruxsat berildi.")
        try:
            await bot.send_message(user_id, "✅ Sizga botdan foydalanish ruxsati berildi!")
        except Exception as e:
            logger.warning("Xabar yuborilmadi %s: %s", user_id, e)
    else:
        await message.reply("❌ Foydalanuvchi allaqachon ruxsat olgan.")

# ---------------- /users (faqat admin) ----------------
@dp.message(Command("users"))
async def show_users(message: types.Message):
    if message.from_user.id != ADMIN_ID:
        return
    total = len(ALLOWED_USERS)
    text = f"👥 Botdan foydalanuvchilar soni: {total}\n\n"
    for uid, uname in ALLOWED_USERS.items():
        text += f"🔹 {uname} (ID: {uid})\n"
    await message.answer(text)

# =============== WEB FORM HANDLER ===============
async def append_to_sheet(row):
    """
    Synchronous gspread.append_row ishlashini thread'da bajaradi.
    """
    if sheet is None:
        raise RuntimeError("Google Sheets bilan ulanish mavjud emas.")
    # gspread append_row - sinxron, shuning uchun threadga olamiz
    return await asyncio.to_thread(sheet.append_row, row)

async def handle_form(request):
    """
    Qabul qiladi: form-data yoki application/json
    Kutilgan maydonlar: name, email, phone, course
    """
    try:
        # Support JSON or form-data
        data = {}
        if request.content_type and "application/json" in request.content_type:
            payload = await request.text()
            try:
                import json
                data = json.loads(payload) if payload else {}
            except Exception:
                data = {}
        else:
            post = await request.post()
            # post bir Mapping-like obyekti
            data = {k: post.get(k) for k in ("name", "email", "phone", "course")}

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()
        course = (data.get("course") or "").strip()

        if not (name and email and phone and course):
            logger.info("Form ma'lumot yetarli emas: %s", data)
            return web.json_response({"status": "error", "message": "Ma'lumot yetarli emas"}, headers={
                "Access-Control-Allow-Origin": "*"
            })

        # Yozish satri: siz xohlagan ketma-ketlik (Ism, Email, Telefon, Kurs, Sana)
        import datetime
        date_str = datetime.datetime.now().isoformat(sep=" ", timespec="seconds")
        row = [name, email, phone, course, date_str]

        try:
            await append_to_sheet(row)
            logger.info("Sheets ga yozildi: %s", row)
        except Exception as e:
            logger.exception("Sheets ga yozishda xatolik: %s", e)
            # ammo davom etamiz: botga habar yuborishni ham tashlab qo'ymaymiz
            return web.json_response({"status": "error", "message": str(e)}, headers={
                "Access-Control-Allow-Origin": "*"
            })

        # Telegramga yuborish (ruxsat olganlarga)
        text = f"📥 Yangi forma yuborildi!\n\n👤 Ism: {name}\n📧 Email: {email}\n📱 Telefon: {phone}\n📚 Kurs: {course}\n🕒 Sana: {date_str}"
        for user_id in list(ALLOWED_USERS.keys()):
            try:
                await bot.send_message(user_id, text)
            except Exception as e:
                logger.warning("Telegramga yuborilmadi %s: %s", user_id, e)

        return web.json_response({"status": "success"}, headers={
            "Access-Control-Allow-Origin": "*"
        })

    except Exception as e:
        logger.exception("handle_form umumiy xato: %s", e)
        return web.json_response({"status": "error", "message": str(e)}, headers={
            "Access-Control-Allow-Origin": "*"
        })

# Preflight (CORS) uchun OPTIONS
async def handle_options(request):
    return web.Response(status=204, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    })

# =============== AIOHTTP APP ===============
app = web.Application()
app.router.add_route("OPTIONS", "/form", handle_options)
app.router.add_post("/form", handle_form)

# =============== RUN BOTH BOT & WEB ===============
async def main():
    # run web server
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 8080)
    await site.start()
    logger.info("🌐 Web server running on http://0.0.0.0:8080")

    # start bot polling
    logger.info("🤖 Bot polling started")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
