# bot.py
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiohttp import web
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import asyncio
from threading import Thread

# ================= CONFIG =================
BOT_TOKEN = "8280370388:AAGjrOXHT7ejFjScjtqD-GJIaKy1RKAn26c"  # Sizning bot token
ADMIN_ID = 1115076314  # Sizning Telegram ID
SPREADSHEET_ID = "18mLwn6i26dgKLaNE2lKvI88I_pANjQlm3rjaWQm_lnQ"  # Google Sheets ID
ALLOWED_USERS = [ADMIN_ID]  # Avval ruxsat olganlar

# Google Sheets ulanish
scope = ["https://spreadsheets.google.com/feeds","https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("service_account.json", scope)
client = gspread.authorize(creds)
sheet = client.open_by_key(SPREADSHEET_ID).sheet1

# ================= BOT =================
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# ================= /start =================
@dp.message(Command("start"))
async def start(message: types.Message):
    if message.from_user.id in ALLOWED_USERS:
        await message.answer("✅ Xush kelibsiz! Siz botdan foydalana olasiz.")
    else:
        await message.answer("❌ Siz ruxsat olmagansiz. Admin bilan bog'laning.")

# ================= /allow =================
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
        ALLOWED_USERS.append(user_id)
        await message.reply(f"✅ Foydalanuvchi {user_id}ga ruxsat berildi.")
        try:
            await bot.send_message(user_id, "✅ Sizga botdan foydalanish ruxsati berildi!")
        except:
            pass
    else:
        await message.reply("❌ Foydalanuvchi allaqachon ruxsat olgan.")

# ================= Webhook / Form handler =================
async def handle_form(request):
    try:
        data = await request.post()  # FormData
        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        course = data.get("course")
        if not (name and email and phone and course):
            return web.json_response({"status": "error", "message": "Ma'lumot yetarli emas"})
        
        # Google Sheets-ga yozish
        sheet.append_row([name, email, phone, course])
        
        # Telegramga yuborish ruxsat olganlarga
        text = f"📥 Yangi forma yuborildi!\n\n👤 Ism: {name}\n📧 Email: {email}\n📱 Telefon: {phone}\n📚 Kurs: {course}"
        for user_id in ALLOWED_USERS:
            try:
                await bot.send_message(user_id, text)
            except:
                pass

        return web.json_response({"status": "success"})
    except Exception as e:
        return web.json_response({"status": "error", "message": str(e)})

# ================= Aiohttp server =================
app = web.Application()
app.router.add_post("/form", handle_form)

# ================= BOT START =================
async def start_bot():
    await dp.start_polling()

# ================= RUN BOTH =================
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    Thread(target=lambda: loop.run_until_complete(start_bot())).start()
    web.run_app(app, host="0.0.0.0", port=8080)
