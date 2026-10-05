// Fixed starfield behind the home's sections (the hero video covers it, the
// footer scene sits on top of it). Pure CSS, see .night-sky in globals.css.
export default function NightSky() {
  return (
    <div className="night-sky" aria-hidden="true">
      <div className="night-sky-stars" />
      <div className="night-sky-twinkle" />
    </div>
  );
}
