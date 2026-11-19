const PAGES = {
  rules: ['Contest rules', ['One shared QR is printed on every packet; there is no sign-up and no customer account.', 'The sponsor, shop and prize stay hidden until the reveal time shown in the app.', 'Only genuine paper from the current day is valid. Previous-day paper is not valid.', 'The first eligible person whose paper is verified by sponsor staff at the shop receives the sponsor-funded prize.', 'KADALUCK does not pay out or process prize money. Prize claims stay disabled until legal review is complete.', 'Do not rush or travel unsafely. Speed of travel is never ranked.']],
  privacy: ['Privacy', ['Customers are not asked to sign in and we do not collect customer accounts.', 'Winner names and photos are shown only with the winner\'s explicit consent and can be removed on request.', 'The app does not use advertising trackers or analytics.', 'Admin sign-in data is handled by Firebase Authentication.']],
  terms: ['Terms of use', ['Information in the app is provided as-is and may change.', 'Sponsors are responsible for their prizes and shop operations.', 'KADALUCK may pause or cancel a campaign at any time.']],
  accessibility: ['Accessibility', ['We aim for WCAG AA contrast, 44px touch targets, keyboard support and reduced-motion support.', 'Tell us about barriers via the Contact page and we will fix them.']],
  contact: ['Contact', ['Questions, winner removal requests or accessibility feedback: please speak to the KADALUCK vendor at the stall.']],
};
export default function Legal({ page }) {
  const [title, items] = PAGES[page];
  return (
    <div className="wrap">
      <h1>{title}</h1>
      <div className="card stack">{items.map((t, i) => <p key={i} className={i ? 'muted' : ''}>{t}</p>)}</div>
    </div>
  );
}
