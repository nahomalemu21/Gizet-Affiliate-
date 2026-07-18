import { BootstrapForm } from "@/components/setup/BootstrapForm";
import { Logo } from "@/components/Logo";
export default function SetupPage(){return <main className="entry-page"><section className="entry-card login-card"><Logo/><div className="entry-copy"><div className="entry-badge">One-time setup</div><h1>Initialize the portal.</h1><p>First add the database and security environment variables in Vercel. Then enter the bootstrap secret below once.</p></div><BootstrapForm/></section></main>}
