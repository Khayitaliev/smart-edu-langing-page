# bot.py
import asyncio
import logging
import json
import os
from aiohttp import web
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

# =============== CONFIG ===============
BOT_TOKEN = "8280370388:AAGjrOXHT7ejFjScjtqD-GJIaKy1RKAn26c"
ADMIN_ID = 1115076314
SPREADSHEET_ID = "18mLwn6i26dgKLaNE2lKvI88I_pANjQlm3rjaWQm_lnQ"
USERS_FILE = "users.json"
FORM_FILE = "form_data.json"

# =============== LOGGING ===============
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============== TELEGRAM BOT SETUP ===============
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# ======== PERSISTENT STORAGE =========
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users():
    with open(USERS_FILE, "w") as f:
        json.dump(ALLOWED_USERS, f)

def load_form_data():
    if os.path.exists(FORM_FILE):
        with open(FORM_FILE, "r") as f:
            return json.load(f)
    return []

def save_form_data():
    with open(FORM_FILE, "w") as f:
        json.dump(FORM_DATA, f)

ALLOWED_USERS = load_users()  # {user_id: username}
FORM_DATA = load_form_data()   # [[name,email,phone,course,date], ...]

# =============== GOOGLE SHEETS SETUP ===============
sheet = None
try:
    scope = ["https://spreadsheets.google.com/feeds",
             "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name("service_account.json", scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SPREADSHEET_ID).sheet1
    logger.info("Google Sheets connected (sheet1).")
except Exception as e:
    logger.exception("Google Sheets connection failed: %s", e)
    sheet = None

# ======= RUXSAT SO‘RASH INLINE BUTTON =======
async def ask_permission(user_id: int):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Ruxsat berish", callback_data=f"allow_{user_id}"),
            InlineKeyboardButton(text="❌ Rad etish", callback_data=f"deny_{user_id}")
        ]
    ])
    await bot.send_message(user_id, "Botdan foydalanish uchun ruxsat so‘ralmoqda:", reply_markup=keyboard)

# ---------------- /start ----------------
@dp.message(Command("start"))
async def start(message: types.Message):
    user_id = message.from_user.id
    username = message.from_user.username or message.from_user.full_name or "Unknown"

    if str(user_id) in ALLOWED_USERS:
        await message.answer("✅ Siz allaqachon ruxsat olgansiz.")
    else:
        await ask_permission(user_id)

# ---------------- INLINE BUTTON CALLBACK ----------------
@dp.callback_query()
async def callback_handler(query: types.CallbackQuery):
    await query.answer()  # 🔑 Har doim chaqirilishi kerak
    data = query.data
    user_id = query.from_user.id

    # Admin ruxsat berish / rad etish tugmalari
    if data.startswith("allow_") and user_id == ADMIN_ID:
        target_id = data.split("_")[1]
        ALLOWED_USERS[str(target_id)] = "Unknown"
        save_users()
        await bot.send_message(int(target_id), "✅ Sizga botdan foydalanish ruxsati berildi!")
        await query.message.edit_text(f"✅ {target_id} foydalanuvchiga ruxsat berildi.")
        return
    elif data.startswith("deny_") and user_id == ADMIN_ID:
        target_id = data.split("_")[1]
        await bot.send_message(int(target_id), "❌ Sizga ruxsat berilmadi.")
        await query.message.edit_text(f"❌ {target_id} foydalanuvchiga ruxsat rad qilindi.")
        return

    # Foydalanuvchini ko‘rish tugmasi
    if data.startswith("view_"):
        target_id = data.split("_")[1]
        username = ALLOWED_USERS.get(str(target_id), "Unknown")

        # Shu foydalanuvchi form ma’lumotlarini chiqaramiz
        user_forms = FORM_DATA  # barcha foydalanuvchilar form ma’lumotlarini ko‘radi
        text = f"🔹 {username} (ID: {target_id})\n\n"
        if user_forms:
            for f in user_forms:
                text += f"👤 {f[0]}, 📧 {f[1]}, 📱 {f[2]}, 📚 {f[3]}, 🕒 {f[4]}\n"
        else:
            text += "❌ Form ma’lumotlari yo‘q.\n"

        keyboard = InlineKeyboardMarkup(row_width=1)
        keyboard.add(
            InlineKeyboardButton(text="❌ O'chirish", callback_data=f"delete_{target_id}")
        )
        await query.message.edit_text(text, reply_markup=keyboard)
        return

    # Foydalanuvchini o‘chirish
    if data.startswith("delete_") and user_id == ADMIN_ID:
        target_id = data.split("_")[1]
        if str(target_id) in ALLOWED_USERS:
            del ALLOWED_USERS[str(target_id)]
            save_users()
            await query.message.edit_text(f"❌ {target_id} foydalanuvchi o‘chirildi.")
        return

# ---------------- /clients ----------------
@dp.message(Command("clients"))
async def show_clients(message: types.Message):
    if str(message.from_user.id) not in ALLOWED_USERS:
        await message.reply("❌ Siz ruxsat olmagansiz.")
        return

    if not ALLOWED_USERS:
        await message.reply("❌ Hozircha foydalanuvchi yo‘q.")
        return

    keyboard = InlineKeyboardMarkup(row_width=1)
    for uid, uname in ALLOWED_USERS.items():
        keyboard.add(
            InlineKeyboardButton(text=f"{uname} (ID: {uid})", callback_data=f"view_{uid}")
        )
    await message.reply("👥 Bot foydalanuvchilari:", reply_markup=keyboard)

# =============== WEB FORM HANDLER ===============
async def append_to_sheet(row):
    if sheet is None:
        logger.warning("Google Sheets bilan ulanish yo‘q.")
        return False
    return await asyncio.to_thread(sheet.append_row, row)

async def handle_form(request):
    try:
        data = {}
        if request.content_type and "application/json" in request.content_type:
            data = await request.json()
        else:
            post = await request.post()
            data = {k: post.get(k) for k in ("name", "email", "phone", "course")}

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()
        course = (data.get("course") or "").strip()
        if not (name and email and phone and course):
            return web.json_response({"status": "error", "message": "Ma'lumot yetarli emas"}, headers={"Access-Control-Allow-Origin": "*"})

        import datetime
        date_str = datetime.datetime.now().isoformat(sep=" ", timespec="seconds")
        row = [name, email, phone, course, date_str]

        await append_to_sheet(row)
        FORM_DATA.append(row)
        save_form_data()

        # Barcha ruxsat olganlarga yuborish
        text = f"📥 Yangi forma yuborildi!\n\n👤 Ism: {name}\n📧 Email: {email}\n📱 Telefon: {phone}\n📚 Kurs: {course}\n🕒 Sana: {date_str}"
        for uid in ALLOWED_USERS.keys():
            try:
                await bot.send_message(int(uid), text)
            except Exception as e:
                logger.warning("Xabar yuborilmadi %s: %s", uid, e)

        return web.json_response({"status": "success"}, headers={"Access-Control-Allow-Origin": "*"})

    except Exception as e:
        logger.exception("handle_form xato: %s", e)
        return web.json_response({"status": "error", "message": str(e)}, headers={"Access-Control-Allow-Origin": "*"})

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
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 8080)
    await site.start()
    logger.info("🌐 Web server running on http://0.0.0.0:8080")

    logger.info("🤖 Bot polling started")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
