// Cores alternadas das bandeirinhas de festa junina, exibidas no topo do Hero (Home e GuestWallet).
const COLORS = ["#C1440E", "#1E3A5F", "#E8940A", "#2D6A4F", "#C1440E", "#E8940A", "#1E3A5F", "#C1440E", "#2D6A4F", "#E8940A", "#1E3A5F", "#C1440E"];

// Faixa decorativa de bandeirinhas (puramente visual, sem interação — por isso aria-hidden).
// Cada bandeirinha é desenhada com CSS puro (borda transparente formando um triângulo) e
// alterna a altura (marginTop) para dar o efeito de "varal" ondulado.
export default function Bandeirinhas() {
    return (<div className="flex items-end w-full overflow-hidden" aria-hidden>
      {COLORS.map((color, i) => (<div key={i} className="flex flex-col items-center flex-1" style={{ marginTop: i % 2 === 0 ? 0 : 10 }}>
          <div className="w-px h-4 bg-amber-900/30"/>
          <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `22px solid ${color}` }}/>
        </div>))}
    </div>);
}
