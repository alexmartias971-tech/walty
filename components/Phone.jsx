import WalletCard from "./WalletCard";

/** Téléphone en verre : écran verrouillé + notification push + carte Wallet. */
export default function Phone({ theme = "plage", card, notif, time = "18:42", className = "", style, animateStamp = true, cardBottom }) {
  const n = notif || {
    app: "Le Bokit du Lagon",
    text: "Plus que 3 tampons avant ton bokit offert. On t'attend ce soir 🌅",
  };
  return (
    <div className={`phone ${className}`} style={style}>
      <div className="phone-screen">
        <div className="phone-island" />
        <div className="phone-status">
          <span>{time}</span>
          <span className="phone-icons">
            <i /><i /><i />
          </span>
        </div>
        <div className="phone-clock">
          <small>mardi 30 septembre</small>
          <b>{time}</b>
        </div>
        <div className="phone-notif">
          <span className="phone-notif-icon" />
          <div>
            <div className="phone-notif-head"><b>{n.app}</b><span>maintenant</span></div>
            <p>{n.text}</p>
          </div>
        </div>
        <div className="phone-card" style={cardBottom !== undefined ? { bottom: cardBottom } : undefined}>
          <WalletCard theme={theme} card={card} animateStamp={animateStamp} />
        </div>
        <div className="phone-home" />
      </div>
    </div>
  );
}
