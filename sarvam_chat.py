import os
import sys
from dotenv import load_dotenv
from sarvamai import SarvamAI

# Load environment variables from .env file
load_dotenv()

api_key = os.getenv("SARVAM_API_KEY")

if not api_key:
    print("Error: SARVAM_API_KEY is not set in your .env file.", file=sys.stderr)
    sys.exit(1)

client = SarvamAI(api_subscription_key=api_key)

response = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[
        {
            "role": "user",
            "content": "Hello! Reply in one short sentence confirming you are working."
        }
    ],
)

print(response.choices[0].message.content)

