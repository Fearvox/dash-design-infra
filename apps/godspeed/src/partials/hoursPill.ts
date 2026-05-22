/* hoursPill.ts — server-rendered pill that ships with a client-side updater.
 *
 * The pill is rendered with the build-time status for SEO + first paint,
 * then a tiny inline script re-renders it against the user's clock.
 */

import { getOpenStatus, type HoursConfig } from "../lib/hours";
import { escapeHtml } from "./head";

export function hoursPill(hours: HoursConfig, now: Date = new Date()): string {
  const status = getOpenStatus(now, hours);
  const cls = status.open ? "gs-hours-pill is-open" : "gs-hours-pill";
  return /* html */ `
<span class="${cls}" data-hours-pill data-hours='${escapeHtml(JSON.stringify(hours))}' aria-live="polite">
  <span class="gs-dot" aria-hidden="true"></span>
  <span class="gs-hours-label">${escapeHtml(status.label)}</span>
</span>
`;
}

/** Inline JS that runs in the browser and refreshes pill labels every 60s.
 * Also handles graceful newsletter form submission via mailto: until Buttondown is wired. */
export const HOURS_PILL_CLIENT_JS = /* js */ `
(function () {
  // Newsletter form → mailto: graceful fallback
  document.querySelectorAll("form[data-newsletter]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var email = input ? input.value.trim() : "";
      if (!email) return;
      var subject = encodeURIComponent("add me to the godspeed journal");
      var body = encodeURIComponent("hi godspeed,\\n\\nplease add this email to the journal newsletter:\\n" + email + "\\n\\nthanks");
      window.location.href = "mailto:hello@godspeed.coffee?subject=" + subject + "&body=" + body;
    });
  });
})();
(function () {
  function hmMin(s){var p=s.split(":");return parseInt(p[0],10)*60+parseInt(p[1],10)}
  function pretty(hm){var m=hmMin(hm),h=Math.floor(m/60),mm=m%60,ap=h<12?"a":"p",h12=h%12===0?12:h%12;return mm===0?h12+ap:h12+":"+String(mm).padStart(2,"0")+ap}
  function tzTime(d,tz){var f=new Intl.DateTimeFormat("en-US",{timeZone:tz,hour:"2-digit",minute:"2-digit",hour12:false});var p=f.formatToParts(d);var hh=(p.find(x=>x.type==="hour")||{}).value||"00";var mm=(p.find(x=>x.type==="minute")||{}).value||"00";if(hh==="24")hh="00";return hh+":"+mm}
  function tzDay(d,tz){return new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"long"}).format(d).toLowerCase()}
  function tzDate(d,tz){return new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).format(d)}
  var DAYS=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  function nextOpen(h,i){for(var k=1;k<=7;k++){var d=DAYS[(i+k)%7],w=h.schedule[d];if(w)return{day:d,opensAt:w.open}}return null}
  function status(now,h){
    var today=tzDay(now,h.timezone),i=DAYS.indexOf(today),dk=tzDate(now,h.timezone);
    var nowM=hmMin(tzTime(now,h.timezone));
    var hol=h.holidays&&h.holidays[dk];
    if(hol===null){var n=nextOpen(h,i);return{open:false,label:n?"closed today (holiday) · opens "+n.day+" "+pretty(n.opensAt):"closed today (holiday)"}}
    var w=(hol===undefined?h.schedule[today]:hol);
    if(!w){var n=nextOpen(h,i);return{open:false,label:n?"closed today · opens "+n.day+" "+pretty(n.opensAt):"closed today"}}
    if(nowM>=hmMin(w.open)&&nowM<hmMin(w.close))return{open:true,label:"open now · closes "+pretty(w.close)};
    if(nowM<hmMin(w.open))return{open:false,label:"closed · opens "+pretty(w.open)+" today"};
    var n=nextOpen(h,i);return{open:false,label:n?"closed · opens "+n.day+" "+pretty(n.opensAt):"closed"}
  }
  function refresh(){
    document.querySelectorAll("[data-hours-pill]").forEach(function(el){
      var hours;try{hours=JSON.parse(el.getAttribute("data-hours"))}catch(e){return}
      var s=status(new Date(),hours);
      el.classList.toggle("is-open",!!s.open);
      var label=el.querySelector(".gs-hours-label");if(label)label.textContent=s.label;
    });
  }
  refresh();setInterval(refresh,60000);
})();
`;
