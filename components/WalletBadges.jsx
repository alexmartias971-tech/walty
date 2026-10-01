/**
 * Badges officiels « Ajouter à Apple Wallet » et « Ajouter à Google Wallet ».
 * Fichiers fournis par Apple (developer.apple.com/wallet) et Google (developers.google.com/wallet),
 * utilisés sans modification : ne pas les recolorer, déformer, animer ni redessiner.
 */
export default function WalletBadges({ caption = "Vos clients l'ajoutent en 1 touche, sans appli à télécharger.", className = "" }) {
  return (
    <div className={`wallet-official ${className}`}>
      <div className="wallet-official-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badges/apple-wallet.svg" alt="Ajouter à Apple Wallet" width="136" height="42" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badges/google-wallet.svg" alt="Ajouter à Google Wallet" width="152" height="42" />
      </div>
      {caption && <p>{caption}</p>}
    </div>
  );
}
