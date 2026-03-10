import { EmailMessage } from "cloudflare:email";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      const success = url.searchParams.get("success") === "1";
      const error = url.searchParams.get("error") === "1";
      return htmlResponse(renderPage({ success, error }));
    }

    if (request.method === "POST" && url.pathname === "/signup") {
      try {
        console.log("POST /signup hit");

        const formData = await request.formData();
        const email = (formData.get("email") || "").toString().trim().toLowerCase();
        const honeypot = (formData.get("company") || "").toString().trim();

        console.log("Parsed form data", {
          hasEmail: !!email,
          honeypotFilled: honeypot !== ""
        });

        if (honeypot !== "") {
          console.log("Honeypot triggered");
          return Response.redirect(new URL("/", request.url), 303);
        }

        if (!isValidEmail(email)) {
          console.log("Invalid email");
          return redirectWithParam(request.url, "error", "1");
        }

        const submittedAt = new Date().toISOString();

        const rawMessage = [
          "From: guestlist@gildedveilco.com",
          "To: gildedveilco@gmail.com",
          "Subject: New Gilded Veil Guest List Signup",
          "Content-Type: text/plain; charset=utf-8",
          "",
          "A new guest joined the list.",
          "",
          `Email: ${email}`,
          `Submitted: ${submittedAt}`
        ].join("\\r\\n");

        console.log("Constructing EmailMessage");

        const message = new EmailMessage(
          "guestlist@gildedveilco.com",
          "gildedveilco@gmail.com",
          rawMessage
        );

        console.log("Sending email via binding", {
          bindingExists: !!env.GUESTLIST_EMAIL
        });

        await env.GUESTLIST_EMAIL.send(message);

        console.log("Email sent successfully");

        return redirectWithParam(request.url, "success", "1");
      } catch (err) {
        console.error("Signup error", {
          message: err?.message,
          stack: err?.stack,
          name: err?.name
        });
        return redirectWithParam(request.url, "error", "1");
      }
    }

    return new Response("Not found", { status: 404 });
  }
};

function redirectWithParam(requestUrl, key, value) {
  const url = new URL(requestUrl);
  url.pathname = "/";
  url.search = "";
  url.searchParams.set(key, value);
  return Response.redirect(url, 303);
}

function isValidEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function htmlResponse(html) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function renderPage({ success, error }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Gilded Veil | Immersive Mystery Experiences</title>
<meta name="description" content="Join the guest list for The Gilded Veil and receive invitations, announcements, and early access to immersive mystery experiences.">
<style>
:root{
  --gold:#c9a85d;
  --gold-soft:#e2c98d;
  --ivory:#f3eee2;
  --muted:#b8ae98;
  --line:rgba(201,168,93,.28);
  --shadow:rgba(0,0,0,.45);
  --success-bg:rgba(35,58,36,.80);
  --success-line:rgba(120,190,120,.45);
  --error-bg:rgba(70,25,25,.85);
  --error-line:rgba(200,100,100,.45);
}
*{box-sizing:border-box;}
html,body{
  margin:0;
  min-height:100%;
  font-family:Georgia, "Times New Roman", serif;
  background:
    radial-gradient(circle at 20% 20%, rgba(201,168,93,.08), transparent 30%),
    radial-gradient(circle at 80% 30%, rgba(201,168,93,.06), transparent 26%),
    radial-gradient(circle at 50% 80%, rgba(255,255,255,.03), transparent 35%),
    linear-gradient(180deg,#050505 0%,#0a0a0a 40%,#111111 100%);
  color:var(--ivory);
}
body{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:32px;
}
.frame{
  position:relative;
  width:100%;
  max-width:980px;
  min-height:640px;
  border:1px solid var(--line);
  background:
    linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0)),
    rgba(8,8,8,.78);
  box-shadow:
    0 30px 60px var(--shadow),
    inset 0 0 0 1px rgba(255,255,255,.02);
  overflow:hidden;
}
.frame::before,
.frame::after{
  content:"";
  position:absolute;
  inset:18px;
  border:1px solid rgba(201,168,93,.12);
  pointer-events:none;
}
.frame::after{
  inset:34px;
  border-color:rgba(201,168,93,.08);
}
.corner{
  position:absolute;
  width:64px;
  height:64px;
  border-color:rgba(201,168,93,.35);
  pointer-events:none;
}
.corner.tl{top:18px;left:18px;border-top:1px solid;border-left:1px solid;}
.corner.tr{top:18px;right:18px;border-top:1px solid;border-right:1px solid;}
.corner.bl{bottom:18px;left:18px;border-bottom:1px solid;border-left:1px solid;}
.corner.br{bottom:18px;right:18px;border-bottom:1px solid;border-right:1px solid;}
.ornament{
  position:absolute;
  width:220px;
  height:220px;
  border:1px solid rgba(201,168,93,.08);
  border-radius:50%;
  filter:blur(.2px);
  pointer-events:none;
}
.ornament.top-left{top:-110px;left:-90px;}
.ornament.bottom-right{bottom:-110px;right:-90px;}
.content{
  position:relative;
  z-index:1;
  min-height:640px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:80px 28px;
  overflow:hidden;
}
.veil-glow{
  position:absolute;
  top:44%;
  left:50%;
  transform:translate(-50%,-50%);
  width:560px;
  height:560px;
  background:radial-gradient(circle, rgba(201,168,93,.16), transparent 70%);
  filter:blur(40px);
  opacity:.65;
  pointer-events:none;
  z-index:0;
}
.shimmer{
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(
      115deg,
      transparent 0%,
      transparent 42%,
      rgba(255,230,170,.035) 48%,
      rgba(255,230,170,.06) 50%,
      rgba(255,230,170,.035) 52%,
      transparent 58%,
      transparent 100%
    );
  transform:translateX(-120%);
  animation:candleShimmer 9s ease-in-out infinite;
  z-index:0;
}
@keyframes candleShimmer{
  0%{transform:translateX(-120%);opacity:0;}
  12%{opacity:.35;}
  50%{transform:translateX(120%);opacity:.5;}
  100%{transform:translateX(120%);opacity:0;}
}
.eyebrow,h1,.divider,.tagline,.subcopy,.cta-wrap,.notice,.footer-note{
  position:relative;
  z-index:1;
}
.eyebrow{
  margin:0 0 18px;
  color:var(--gold-soft);
  font-size:.8rem;
  letter-spacing:.38em;
  text-transform:uppercase;
}
h1{
  margin:0;
  font-size:clamp(2.8rem, 8vw, 5.8rem);
  font-weight:400;
  line-height:.95;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:var(--ivory);
  text-shadow:0 0 12px rgba(201,168,93,.25),0 2px 18px rgba(0,0,0,.4);
}
.divider{
  width:140px;
  height:1px;
  margin:28px auto 26px;
  background:linear-gradient(90deg, transparent, var(--gold), transparent);
}
.tagline{
  max-width:680px;
  margin:0 auto;
  font-size:clamp(1.05rem, 2.1vw, 1.35rem);
  line-height:1.75;
  color:var(--muted);
}
.tagline strong{color:var(--ivory);font-weight:400;}
.subcopy{
  max-width:620px;
  margin:26px auto 0;
  font-size:.98rem;
  line-height:1.8;
  color:var(--gold-soft);
  opacity:.92;
}
.cta-wrap{
  margin-top:34px;
  width:100%;
  display:flex;
  justify-content:center;
  position:relative;
  z-index:2;
}
.signup-shell{
  width:100%;
  max-width:620px;
  padding:18px;
  border:1px solid rgba(201,168,93,.22);
  background:rgba(10,10,10,.42);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.02);
  position:relative;
  z-index:2;
}
.signup-form{
  display:flex;
  gap:12px;
  justify-content:center;
  align-items:center;
  flex-wrap:wrap;
  position:relative;
  z-index:2;
}
.email-input{
  flex:1 1 300px;
  min-width:280px;
  padding:15px 16px;
  background:#111;
  border:1px solid rgba(201,168,93,.4);
  color:var(--ivory);
  font-family:inherit;
  font-size:.98rem;
  outline:none;
  position:relative;
  z-index:2;
}
.email-input::placeholder{color:#9f967e;}
.email-input:focus{
  border-color:rgba(226,201,141,.85);
  box-shadow:0 0 0 3px rgba(201,168,93,.08);
}
.honeypot{
  position:absolute;
  left:-9999px;
  width:0;
  height:0;
  opacity:0;
  pointer-events:none;
}
.button{
  min-width:220px;
  padding:15px 26px;
  border:1px solid rgba(201,168,93,.55);
  background:linear-gradient(180deg, rgba(201,168,93,.12), rgba(201,168,93,.04));
  color:var(--ivory);
  text-transform:uppercase;
  letter-spacing:.18em;
  font-size:.78rem;
  font-family:inherit;
  cursor:pointer;
  transition:transform .2s ease, background .2s ease, border-color .2s ease;
  position:relative;
  z-index:2;
}
.button:hover{
  transform:translateY(-1px);
  background:linear-gradient(180deg, rgba(201,168,93,.18), rgba(201,168,93,.07));
  border-color:rgba(226,201,141,.9);
}
.form-note{
  margin-top:12px;
  font-size:.82rem;
  color:rgba(184,174,152,.82);
  letter-spacing:.04em;
}
.notice{
  max-width:620px;
  margin-top:18px;
  padding:12px 16px;
  font-size:.95rem;
  line-height:1.6;
  border:1px solid transparent;
  display:none;
}
.notice.success{background:var(--success-bg);border-color:var(--success-line);}
.notice.error{background:var(--error-bg);border-color:var(--error-line);}
.notice.show{display:block;}
.footer-note{
  margin-top:28px;
  font-size:.82rem;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:rgba(184,174,152,.82);
}
.footer-note span{color:var(--gold-soft);}
@media (max-width:640px){
  body{padding:14px;}
  .content{padding:64px 20px;}
  .frame,.content{min-height:560px;}
  .veil-glow{width:380px;height:380px;}
  .eyebrow{letter-spacing:.28em;}
  .signup-shell{padding:14px;}
  .signup-form{flex-direction:column;}
  .email-input,.button{width:100%;min-width:0;}
}
</style>
</head>
<body>
<main class="frame">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="ornament top-left"></div>
  <div class="ornament bottom-right"></div>

  <section class="content">
    <div class="veil-glow"></div>
    <div class="shimmer"></div>

    <p class="eyebrow">You Are Invited</p>
    <h1>The Gilded Veil</h1>
    <div class="divider"></div>

    <p class="tagline">
      Immersive evenings of <strong>mystery, elegance, and intrigue</strong>.
      A world of candlelight, secrets, and unforgettable revelations is now taking shape.
    </p>

    <p class="subcopy">
      Our first experiences are forthcoming. Enter your email below to receive your invitation,
      announcements, and early access.
    </p>

    <div class="cta-wrap">
      <div class="signup-shell">
        <form class="signup-form" action="/signup" method="POST">
          <input type="text" name="company" class="honeypot" autocomplete="off" tabindex="-1">
          <input class="email-input" type="email" name="email" placeholder="Enter your email" required>
          <button class="button" type="submit">Join the Guest List</button>
        </form>
        <p class="form-note">No spam. Invitations and early announcements only.</p>
      </div>
    </div>

    <div id="success" class="notice success${success ? " show" : ""}">
      Thank you. Your invitation request has been received.
    </div>

    <div id="error" class="notice error${error ? " show" : ""}">
      Something went wrong. Please try again in a moment.
    </div>

    <p class="footer-note">Launching soon from <span>The Gilded Veil</span></p>
  </section>
</main>
</body>
</html>`;
}
