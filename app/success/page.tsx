export default function SuccessPage() {
  const link = process.env.WHATSAPP_GROUP_LINK || "#";
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border-t-8 border-[#87CEEB]">
        <h1 className="text-4xl mb-2">🎉 Registration Successful!</h1>
        <p className="text-gray-600 mb-6">
          You are now part of the DELITECH IT Club.
        </p>
        <p className="font-bold text-lg">
          Click below to join the official DELITECH IT CLUB group:
        </p>
        <a
          href={link}
          target="_blank"
          className="block mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition"
        >
          📱 Join WhatsApp Group
        </a>
        <p className="text-xs text-gray-400 mt-6">
          We saved your details and selfie securely.
        </p>
      </div>
    </div>
  );
}
