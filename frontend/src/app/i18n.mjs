export const supportedLocales = ["en", "my"];

const messages = {
  en: {
    home: "Home", products: "Products", about: "About Us", profile: "Profile", security: "Security", support: "Support",
    heroTitle: "Find the right phone without the guesswork.",
    heroBody: "Browse current stock, compare specifications, and check out securely with tracked delivery.",
    shopPhones: "Shop phones", compareModels: "Compare models", highlights: "Store highlights", categories: "Shop by category",
    latest: "Latest products", justAdded: "Just added", viewAll: "View all", recommended: "Recommended for you", recent: "Recently viewed",
    live: "Live", stockAvailability: "stock availability", secure: "Secure", stripeCheckout: "Stripe checkout", tracked: "Tracked",
    orderDelivery: "order delivery", easy: "Easy", returnsSupport: "returns support", language: "Language",
  },
  my: {
    home: "ပင်မ", products: "ကုန်ပစ္စည်းများ", about: "ကျွန်ုပ်တို့အကြောင်း", profile: "ကိုယ်ရေးအချက်အလက်", security: "လုံခြုံရေး", support: "အကူအညီ",
    heroTitle: "သင့်အတွက် သင့်တော်သော ဖုန်းကို လွယ်ကူစွာ ရှာဖွေပါ။",
    heroBody: "လက်ရှိပစ္စည်းစာရင်းကို ကြည့်ရှု၊ အသေးစိတ်အချက်အလက်များကို နှိုင်းယှဉ်ပြီး လုံခြုံစွာ ဝယ်ယူပါ။",
    shopPhones: "ဖုန်းများဝယ်ရန်", compareModels: "မော်ဒယ်များနှိုင်းယှဉ်ရန်", highlights: "ဆိုင်၏အားသာချက်များ", categories: "အမျိုးအစားအလိုက် ဝယ်ရန်",
    latest: "နောက်ဆုံးကုန်ပစ္စည်းများ", justAdded: "အသစ်ထည့်ထားသည်", viewAll: "အားလုံးကြည့်ရန်", recommended: "သင့်အတွက် အကြံပြုချက်များ", recent: "မကြာသေးမီက ကြည့်ထားသည်",
    live: "တိုက်ရိုက်", stockAvailability: "ပစ္စည်းလက်ကျန်", secure: "လုံခြုံ", stripeCheckout: "Stripe ငွေပေးချေမှု", tracked: "ခြေရာခံနိုင်", orderDelivery: "ပို့ဆောင်မှု", easy: "လွယ်ကူ", returnsSupport: "ပြန်အပ်မှုအကူအညီ", language: "ဘာသာစကား",
  },
};

export function translate(locale, key) {
  return messages[supportedLocales.includes(locale) ? locale : "en"][key] || messages.en[key] || key;
}
