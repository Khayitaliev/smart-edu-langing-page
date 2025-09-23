import logging
from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime

# 🔑 Bot tokeningiz
API_TOKEN = "8280370388:AAGjrOXHT7ejFjScjtqD-GJIaKy1RKAn26c"

# 🔐 Google Sheets ulanish
scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]

# bu faylni oldin yuklab olgansiz (credentials.json)
creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
client = gspread.authorize(creds)

# Google Sheets fayl nomi
spreadsheet = client.open("Oquvchilar")  # Google Sheets nomi shu bo‘lishi kerak
worksheet = spreadsheet.sheet1

# Logging
logging.basicConfig(level=logging.INFO)

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)


# 🚀 /start buyrug‘i
@dp.message_handler(commands=["start"])
async def send_welcome(message: types.Message):
    await message.reply("Assalomu alaykum! 👋\nMenga o‘quvchi ma’lumotlarini yuboring.\n"
                        "Format:\n\nIsm, Email, Telefon, Kurs")


# 📥 Ma’lumot qabul qilish
@dp.message_handler()
async def save_data(message: types.Message):
    try:
        # Ma’lumotni bo‘lish (vergul orqali)
        data = message.text.split(",")
        if len(data) < 4:
            await message.reply("❌ Ma’lumot to‘liq emas!\n"
                                "Format: Ism, Email, Telefon, Kurs")
            return

        name = data[0].strip()
        email = data[1].strip()
        phone = data[2].strip()
        course = data[3].strip()
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Google Sheetsga yozish
        worksheet.append_row([name, email, phone, course, date])

        # Sizga tasdiq yuboradi
        await message.reply("✅ Ma’lumot saqlandi!\n"
                            f"👤 Ism: {name}\n📧 Email: {email}\n📱 Telefon: {phone}\n📘 Kurs: {course}")

        # O‘qituvchiga yoki sizga ham xabar yuboradi
        admin_id = 1115076314  # sizning chat_id
        await bot.send_message(admin_id, f"📥 Yangi o‘quvchi qo‘shildi:\n\n"
                                         f"👤 Ism: {name}\n"
                                         f"📧 Email: {email}\n"
                                         f"📱 Telefon: {phone}\n"
                                         f"📘 Kurs: {course}\n"
                                         f"🕒 Sana: {date}")

    except Exception as e:
        await message.reply(f"❌ Xatolik: {e}")


if __name__ == "__main__":
    executor.start_polling(dp, skip_updates=True)
