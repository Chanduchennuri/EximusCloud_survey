import { MessageCircle } from "lucide-react";

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.69 5.41-5.25 5.7.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.5 10.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>Built by Chennuri Chandrasekhar (Austin)</p>
        <div className="flex items-center gap-5">
          
            <a href="https://wa.me/919032098602"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 transition"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          
            <a href="https://github.com/Chanduchennuri"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 transition"
          >
            <GithubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          
            <a href="https://www.linkedin.com/in/chandrasekhar-chennuri-austin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 transition"
          >
            <LinkedinIcon />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;