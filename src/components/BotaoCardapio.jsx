export function BotaoCardapio() {
  return (
    <div className="mt-4 px-4 w-full">
      <a
        href="/cardapio-festa.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full py-4 text-lg font-bold text-white bg-orange-600 rounded-xl shadow-md active:bg-orange-700 transition-colors"
      >
        <span className="mr-2">🌽</span> Ver Cardápio da Festa
      </a>
      <p className="text-center text-xs text-gray-500 mt-2">
        Abre em uma nova aba
      </p>
    </div>
  );
}