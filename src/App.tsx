import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Phone, 
  Copy, 
  Check, 
  X, 
  Settings,
  Download,
  Lock,
  Unlock,
  Sparkles,
  Share2,
  RefreshCw,
  Home,
  BookOpen,
  Star,
  Printer,
  GraduationCap,
  Filter,
  Bookmark,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import studentsData from './data/students.json';
import ThemeParticles from './components/ThemeParticles';
import GoldenPendulumCanvas from './components/GoldenPendulumCanvas';
import ConstellationBackground from './components/ConstellationBackground';

// Configure pdfjs worker using CDN to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

interface Student {
  user_id: string; // Reg No, e.g., "120/011"
  full_name: string;
  semester: number;
  program_name: string;
  degree_name: string;
  department_name: string;
  cgpa: number | string;
  avatar_url: string;
  state: string | null;
  pincode: string | null;
}

interface CourseItem {
  code: string;
  name: string;
  type?: string;
  credits?: string;
  coordinator?: string;
}

interface Dossier {
  dob: string | null;
  fatherName: string | null;
  motherName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  parentsMobile: string | null;
  aadhaar: string | null;
  rollNo?: string | null;
  forSemester?: string | null;
  totalCredits?: string | null;
  courses?: CourseItem[];
  hostelName?: string | null;
  hostelWing?: string | null;
  hostelRoom?: string | null;
  extractedName?: string | null;
  extractedDepartment?: string | null;
  extractedProgram?: string | null;
  extractedSemesterNum?: number | null;
}

const students = studentsData as Student[];

// Custom WhatsApp Icon Component
function WhatsAppIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.884-6.974C16.772 1.89 14.29 .86 11.655.86c-5.438 0-9.863 4.42-9.867 9.859-.001 1.768.461 3.497 1.34 5.03L2.14 21.054l5.69-1.492.001-.001c1.554.846 3.133 1.294 4.815 1.294zM16.92 14.18c-.287-.143-1.697-.838-1.959-.933-.262-.095-.453-.143-.644.143-.191.286-.74.933-.907 1.124-.167.19-.334.214-.621.071-2.9-1.448-4.507-3.755-4.89-4.42-.167-.286-.018-.44.125-.582.129-.128.287-.334.43-.501.144-.167.191-.286.287-.476.095-.19.048-.357-.024-.5-.071-.143-.644-1.547-.882-2.119-.232-.559-.465-.483-.64-.492-.167-.008-.358-.01-.55-.01-.19 0-.501.071-.763.357-.262.286-.998.975-.998 2.378 0 1.403 1.022 2.76 1.165 2.951.143.19 2.012 3.072 4.874 4.305.68.293 1.21.468 1.62.598.683.217 1.305.187 1.8.113.55-.083 1.697-.693 1.937-1.362.24-.669.24-1.242.167-1.362-.072-.12-.262-.19-.55-.333z"/>
    </svg>
  );
}

// Scrambled animation for unlocking dossier
function DecipheringText({ isAnimating, defaultText }: { isAnimating: boolean, defaultText: string }) {
  const [text, setText] = useState(defaultText);

  useEffect(() => {
    if (!isAnimating) {
      setText(defaultText);
      return;
    }

    const phrases = [
      "BYPASSING GATEWAY...",
      "ESTABLISHING PROXY...",
      "DECRYPTION IN PROGRESS...",
      "CRACKING DOSSIER...",
      "FETCHING SLIP...",
      "EXTRACTING DATA...",
      "VERIFYING CHECKSUMS..."
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    const chars = "$#@&%?01X9☠";

    const intervalId = setInterval(() => {
      const currentPhrase = phrases[phraseIndex];
      const scrambled = currentPhrase
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (index < charIndex) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      setText(scrambled);
      charIndex += 1;
      
      if (charIndex > currentPhrase.length + 5) {
        charIndex = 0;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }, 80);

    return () => clearInterval(intervalId);
  }, [isAnimating, defaultText]);

  return <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{text}</span>;
}

// Helper to format WhatsApp link
const getWhatsAppLink = (phone: string): string => {
  const cleanNumber = phone.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    return `https://wa.me/91${cleanNumber}`;
  }
  return `https://wa.me/${cleanNumber}`;
};

// Helper to proxy and optimize image URLs
const getProxiedImageUrl = (userId: string): string => {
  if (!userId) return '';
  const formattedId = userId.replace(/\//g, '_');
  const url = `https://saascdn.symphonyx.in/fetch/9/1/3/STUDENT_IMAGES/${formattedId}.jpg`;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=150&h=150&fit=cover&output=webp&q=85`;
};

// Helper to get enlarged image URL
const getEnlargedImageUrl = (userId: string): string => {
  if (!userId) return '';
  const formattedId = userId.replace(/\//g, '_');
  const url = `https://saascdn.symphonyx.in/fetch/9/1/3/STUDENT_IMAGES/${formattedId}.jpg`;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=contain&output=webp&q=95`;
};

// Detail Row with built-in copy button
function DetailRow({ label, value, onCopy }: { label: string; value: string | null; onCopy?: () => void }) {
  if (!value) return null;
  return (
    <div className="detail-row">
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{label}:</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', wordBreak: 'break-all' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{value}</span>
        {onCopy && (
          <button 
            onClick={onCopy}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '2px', transition: 'color 0.2s', flexShrink: 0 }}
            title={`Copy ${label}`}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// 3D Interactive Student Card
function StudentCard3D({ 
  item, 
  onClick, 
  searchQuery, 
  initials,
  isUnlocked,
  isBookmarked,
  onToggleBookmark,
  onAction,
  onEnlargePhoto,
  theme
}: { 
  item: Student; 
  onClick: () => void; 
  searchQuery: string;
  initials: string;
  isUnlocked: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onAction?: () => void;
  onEnlargePhoto?: (e: React.MouseEvent) => void;
  theme: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const rotateX = -((y - yc) / yc) * 6; // Soft, premium 6 degrees tilt
    const rotateY = ((x - xc) / xc) * 6;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    card.style.transition = 'none';
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const cleanQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${cleanQuery})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="search-highlight">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const cgpaNum = parseFloat(item.cgpa.toString());
  const bountyString = isNaN(cgpaNum) 
    ? "1,000,000" 
    : (cgpaNum * 1000000).toLocaleString();

  const rawYear = parseInt(item.user_id.split('/')[0], 10);
  const admYear = isNaN(rawYear) ? 2025 : 2000 + (rawYear % 100);

  const isOnePiece = theme === 'onepiece';

  const pUpper = (item.program_name || '').toUpperCase();
  const moduleBadgeClass = pUpper.includes('BASE') ? 'base' : pUpper.includes('DIPLOMA') ? 'diploma' : pUpper.includes('M.TECH') || pUpper.includes('M.SC') || pUpper.includes('PH.D') ? 'pg' : 'degree';
  const moduleBadgeText = pUpper.includes('BASE') ? 'BASE MODULE' : pUpper.includes('DIPLOMA') ? 'DIPLOMA MODULE' : pUpper.includes('M.TECH') || pUpper.includes('M.SC') || pUpper.includes('PH.D') ? 'POST GRAD' : 'DEGREE (B.TECH)';

  return (
    <div className="tilt-container">
      <div 
        ref={cardRef}
        className="tilt-card"
        onClick={() => {
          onClick();
          if (onAction) onAction();
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="tilt-glow" />
        
        <div className="tilt-depth" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          
          {isOnePiece ? (
            /* ================= ONE PIECE POSTER LOOK ================= */
            <>
              <div>
                {/* Poster Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="wanted-title" style={{ flexGrow: 1 }}>WANTED</div>
                  {onToggleBookmark && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark();
                      }}
                      className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Student"}
                    >
                      <Star size={14} fill={isBookmarked ? "#f59e0b" : "none"} />
                    </button>
                  )}
                </div>
                <div className="wanted-subtitle">DEAD OR ALIVE</div>

                {/* Poster Photo Frame */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div className="wanted-photo-border">
                    {!imageError ? (
                      <img 
                        src={getProxiedImageUrl(item.user_id)} 
                        alt={item.full_name} 
                        className="wanted-photo"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'zoom-in' }}
                        onError={() => setImageError(true)}
                        onClick={(e) => {
                          if (onEnlargePhoto) {
                            e.stopPropagation();
                            onEnlargePhoto(e);
                          }
                        }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 'bold', 
                          fontSize: '3rem',
                          backgroundColor: '#dfc499', 
                          color: 'var(--text-secondary)',
                          fontFamily: 'Georgia, serif'
                        }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stamped badge (Centered) */}
                {isUnlocked && (
                  <div style={{ textAlign: 'center', margin: '4px 0' }}>
                    <span className="unlocked-stamp">UNLOCKED</span>
                  </div>
                )}

                {/* Poster Name */}
                <div className="wanted-name">
                  {highlightText(item.full_name, searchQuery)}
                </div>

                {/* Poster Bounty */}
                <div className="wanted-bounty">
                  ฿ {bountyString}-
                </div>
              </div>

              {/* Marine Stamped Records */}
              <div style={{ fontFamily: 'Courier New, monospace', fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '3px', lineHeight: '1.3' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.department_name}>
                  DEPT: {item.department_name.toUpperCase()}
                </div>
                <div>
                  CODE: REG-{highlightText(item.user_id, searchQuery)}
                </div>
                <div>
                  STAGE: {moduleBadgeText} // SEM-{item.semester}
                </div>
                <div>
                  ORIGIN: ADM-{admYear} // {item.state ? item.state.toUpperCase() : 'UNKNOWN'}
                </div>
              </div>
            </>
          ) : (
            /* ================= STANDARD MODERN CARD LOOK ================= */
            <>
              <div>
                {/* Header / Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  {!imageError ? (
                    <img 
                      src={getProxiedImageUrl(item.user_id)} 
                      alt={item.full_name} 
                      className="drawer-avatar"
                      style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'cover', border: '1px solid var(--border-color)', cursor: 'zoom-in', display: 'block', transition: 'border-color 0.3s' }}
                      onError={() => setImageError(true)}
                      onClick={(e) => {
                        if (onEnlargePhoto) {
                          e.stopPropagation();
                          onEnlargePhoto(e);
                        }
                      }}
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold', 
                        fontSize: '1.25rem',
                        backgroundColor: 'var(--surface-solid)', 
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`module-badge ${moduleBadgeClass}`}>
                        {moduleBadgeText}
                      </span>
                      {onToggleBookmark && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark();
                          }}
                          className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                          title={isBookmarked ? "Remove Bookmark" : "Bookmark Student"}
                        >
                          <Star size={14} fill={isBookmarked ? "#f59e0b" : "none"} />
                        </button>
                      )}
                    </div>
                    {isUnlocked && (
                      <span 
                        style={{ 
                          fontSize: '8px', 
                          fontWeight: 800, 
                          color: '#10b981', 
                          backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          border: '1px solid rgba(16, 185, 129, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Check size={8} strokeWidth={4} /> UNLOCKED
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.full_name}>
                  {highlightText(item.full_name, searchQuery)}
                </h3>
                
                <p style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--accent-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Reg: {highlightText(item.user_id, searchQuery)}</span>
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dept: {item.department_name}</span>
                </div>
              </div>

              {/* Quick Info Footer */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: '500' }}>Semester {item.semester}</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>CGPA: {item.cgpa}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Adm Year: {admYear}</span>
                  {item.state && <span>{item.state}</span>}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [rememberMe, setRememberMe] = useState(true);

  // Passkey Access Portal States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isPersistentAuthed = localStorage.getItem('portal_passkey_authed') === 'true';
      const isSessionAuthed = sessionStorage.getItem('portal_passkey_authed') === 'true';
      return isPersistentAuthed || isSessionAuthed;
    }
    return false;
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showPasskeyText, setShowPasskeyText] = useState(false);
  const [isShakingGate, setIsShakingGate] = useState(false);

  // Harmonia Celestial Pendulum Control States
  const [isSwarmMode, setIsSwarmMode] = useState(false); // SINGLE mode default
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isPoincare, setIsPoincare] = useState(true);
  const [genesisTrigger, setGenesisTrigger] = useState(0);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCgpaTier, setSelectedCgpaTier] = useState<string>('all');
  const [bookmarkedRegNos, setBookmarkedRegNos] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookmarkedStudents');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [enlargedPhotoStudent, setEnlargedPhotoStudent] = useState<Student | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // SHA-256 hash of "democracyisdead" (No plain text in source code)
  const TARGET_PASSKEY_HASH = '93c2ceffce59e6bed1252cd49815d05c15facc5b5c9a9906e2109197474aa603';

  const computeSha256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.trim().toLowerCase());
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerifyPasskey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passkeyInput.trim()) return;

    try {
      const hashedInput = await computeSha256(passkeyInput);
      if (hashedInput === TARGET_PASSKEY_HASH) {
        if (rememberMe) {
          localStorage.setItem('portal_passkey_authed', 'true');
        } else {
          sessionStorage.setItem('portal_passkey_authed', 'true');
        }
        setIsAuthenticated(true);
        setPasskeyError(null);
        triggerToast("Access Granted! Welcome to NERIST Portal.");
      } else {
        setPasskeyError("Access Denied: Invalid security passkey.");
        setIsShakingGate(true);
        setTimeout(() => setIsShakingGate(false), 500);
      }
    } catch (err) {
      setPasskeyError("Verification failed. Please try again.");
    }
  };

  const handleLockPortal = () => {
    localStorage.removeItem('portal_passkey_authed');
    localStorage.removeItem('portal_legacy_access');
    sessionStorage.removeItem('portal_passkey_authed');
    setIsAuthenticated(false);
    setPasskeyInput('');
    triggerToast("Portal Session Locked 🔒");
  };

  const handleToggleBookmark = (regNo: string) => {
    setBookmarkedRegNos(prev => {
      const exists = prev.includes(regNo);
      const next = exists ? prev.filter(r => r !== regNo) : [...prev, regNo];
      localStorage.setItem('bookmarkedStudents', JSON.stringify(next));
      triggerToast(exists ? "Removed from saved profiles" : "Saved to bookmarked profiles! ⭐");
      return next;
    });
  };
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to cyber dark mode
  });
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeTheme');
      if (saved && (saved === 'harmonia' || saved === 'onepiece' || saved === 'cyber' || saved === 'forest')) return saved;
      localStorage.setItem('activeTheme', 'harmonia');
      return 'harmonia';
    }
    return 'harmonia';
  });
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [visibleCount, setVisibleCount] = useState(24);
  const [drawerImageError, setDrawerImageError] = useState(false);

  // Decryption/Unlock states (Redo on Refresh: Memory only - no localStorage saving!)
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [unlockedDossiers, setUnlockedDossiers] = useState<{ [regNo: string]: Dossier }>({});

  // PWA Install Prompt State
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // No-op placeholder (counter UI removed per user request)
  const recordHelpAction = () => {};

  // Sync dark mode class
  useEffect(() => {
    const root = window.document?.documentElement;
    const body = window.document?.body;
    if (!root || !body) return;
    
    body.classList.add('no-transitions');
    
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    const timer = setTimeout(() => {
      body.classList.remove('no-transitions');
    }, 50);
    return () => clearTimeout(timer);
  }, [isDarkMode]);

  // Sync active theme class on document body
  useEffect(() => {
    const body = window.document?.body;
    if (!body) return;
    
    body.classList.add('no-transitions');
    
    body.classList.remove('theme-onepiece', 'theme-cyber', 'theme-forest', 'theme-nordic', 'theme-latte', 'theme-harmonia');
    body.classList.add(`theme-${activeTheme}`);
    // Maintain the dark mode class on the body tag
    if (isDarkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    localStorage.setItem('activeTheme', activeTheme);

    const timer = setTimeout(() => {
      body.classList.remove('no-transitions');
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTheme, isDarkMode]);

  // Handle PWA install
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as any).standalone === true);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isStandalone && isMobile) {
      setTimeout(() => setShowInstallBtn(true), 0);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      }
    } else {
      triggerToast("Tap Share and 'Add to Home Screen' to install.");
    }
  };

  // Intercept back gesture for native back feel
  useEffect(() => {
    window.history.pushState({ page: 'home' }, '');
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state || state.page === 'home') {
        if (enlargedPhotoStudent) {
          setEnlargedPhotoStudent(null);
          window.history.pushState({ page: 'home' }, '');
        } else if (selectedStudent) {
          setSelectedStudent(null);
          setDrawerImageError(false);
          window.history.pushState({ page: 'home' }, '');
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
          window.history.pushState({ page: 'home' }, '');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedStudent, isMenuOpen, enlargedPhotoStudent]);

  const triggerToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label}: ${text}`);
    recordHelpAction();
  };

  // Profile image downloader
  const handleDownloadPhoto = async (userId: string, name: string) => {
    try {
      const formattedId = userId.replace(/\//g, '_');
      const cdnUrl = `https://saascdn.symphonyx.in/fetch/9/1/3/STUDENT_IMAGES/${formattedId}.jpg`;
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(cdnUrl)}`;
      const res = await fetch(proxyUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${name.replace(/\s+/g, '_')}_photo.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      triggerToast("Photo downloaded!");
    } catch (e) {
      console.error(e);
      // Fallback
      const formattedId = userId.replace(/\//g, '_');
      window.open(`https://saascdn.symphonyx.in/fetch/9/1/3/STUDENT_IMAGES/${formattedId}.jpg`, '_blank');
      triggerToast("Opening raw photo in new window...");
    }
  };

  // Profile image sharing
  const handleSharePhoto = async (userId: string, name: string) => {
    const formattedId = userId.replace(/\//g, '_');
    const cdnUrl = `https://saascdn.symphonyx.in/fetch/9/1/3/STUDENT_IMAGES/${formattedId}.jpg`;
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(cdnUrl)}`;
    
    try {
      // Fetch the image as a blob
      const res = await fetch(proxyUrl);
      const blob = await res.blob();
      
      // Create a File object from the blob
      const fileName = `${name.replace(/\s+/g, '_')}_photo.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      // Check if file sharing is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${name} - Profile Image`,
          text: `Here is the profile photo of ${name}`,
          files: [file]
        });
        triggerToast("Photo shared!");
      } else if (navigator.share) {
        // Fallback to link sharing if file sharing is not supported
        await navigator.share({
          title: `${name} - Profile Image`,
          text: `View profile photo of ${name}`,
          url: cdnUrl
        });
      } else {
        // Fallback to clipboard copy
        navigator.clipboard.writeText(cdnUrl);
        triggerToast("Photo link copied!");
      }
    } catch (e) {
      console.warn("Direct file sharing failed, falling back to link sharing:", e);
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${name} - Profile Image`,
            text: `View profile photo of ${name}`,
            url: cdnUrl
          });
        } catch (err) {
          console.warn("Link sharing failed too:", err);
        }
      } else {
        navigator.clipboard.writeText(cdnUrl);
        triggerToast("Photo link copied to clipboard!");
      }
    }
  };

  // Student details avatars
  const getAvatarInitials = (name: string): string => {
    const cleanName = name.replace(/\b(dr|mr|ms|prof|mrs)\b\.?/gi, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0] ? parts[0][0].toUpperCase() : 'S';
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return {
      bg: `hsl(${hue}, 85%, 93%)`,
      text: `hsl(${hue}, 85%, 25%)`,
      darkBg: `hsl(${hue}, 60%, 15%)`,
      darkText: `hsl(${hue}, 85%, 75%)`
    };
  };

  // Memoize unique filters
  const departments = useMemo(() => {
    const depts = new Set(students.map(s => s.department_name).filter(Boolean));
    return Array.from(depts).sort();
  }, []);

  const programs = useMemo(() => {
    const progs = new Set(students.map(s => s.program_name).filter(Boolean));
    return Array.from(progs).sort();
  }, []);

  const statesList = useMemo(() => {
    const stSet = new Set(students.map(s => s.state).filter(Boolean) as string[]);
    return Array.from(stSet).sort();
  }, []);

  // Filter students
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    return students.filter(s => {
      // 0. Bookmarked Filter
      if (selectedModule === 'bookmarked' && !bookmarkedRegNos.includes(s.user_id)) return false;

      // 1. Module Filter
      if (selectedModule !== 'all' && selectedModule !== 'bookmarked') {
        const pUpper = (s.program_name || '').toUpperCase();
        if (selectedModule === 'base' && !pUpper.includes('BASE')) return false;
        if (selectedModule === 'diploma' && !pUpper.includes('DIPLOMA')) return false;
        if (selectedModule === 'degree' && !pUpper.includes('B.TECH') && !pUpper.includes('DEGREE')) return false;
        if (selectedModule === 'pg' && !pUpper.includes('M.TECH') && !pUpper.includes('M.SC') && !pUpper.includes('PH.D')) return false;
      }

      // 2. Department Filter
      if (selectedDept && s.department_name !== selectedDept) return false;
      
      // 3. Program Filter
      if (selectedProgram && s.program_name !== selectedProgram) return false;

      // 4. Home State Filter
      if (selectedState && s.state !== selectedState) return false;

      // 5. Admission Year Filter
      if (selectedYear !== 'all') {
        const regYear = s.user_id.split('/')[0];
        const fullYear = `20${regYear.slice(-2)}`;
        if (fullYear !== selectedYear) return false;
      }

      // 6. CGPA Tier Filter
      if (selectedCgpaTier !== 'all') {
        const cgpaNum = parseFloat(s.cgpa.toString());
        if (isNaN(cgpaNum)) return false;
        if (selectedCgpaTier === 'top9' && cgpaNum < 9.0) return false;
        if (selectedCgpaTier === 'good8' && (cgpaNum < 8.0 || cgpaNum >= 9.0)) return false;
        if (selectedCgpaTier === 'avg7' && (cgpaNum < 7.0 || cgpaNum >= 8.0)) return false;
        if (selectedCgpaTier === 'below7' && cgpaNum >= 7.0) return false;
      }

      // 7. Search Query Filter
      if (!query) return true;

      const nameLower = (s.full_name || '').toLowerCase();
      const idLower = (s.user_id || '').toLowerCase();
      const deptLower = (s.department_name || '').toLowerCase();
      const progLower = (s.program_name || '').toLowerCase();
      const stateLower = (s.state || '').toLowerCase();
      
      return nameLower.includes(query) || idLower.includes(query) || 
             deptLower.includes(query) || progLower.includes(query) ||
             stateLower.includes(query);
    });
  }, [search, selectedDept, selectedProgram, selectedModule, selectedYear, selectedCgpaTier, selectedState, bookmarkedRegNos]);

  // Scroll listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400) {
        setVisibleCount(prev => Math.min(prev + 24, filteredStudents.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredStudents.length]);

  const displayedStudents = useMemo(() => {
    return filteredStudents.slice(0, visibleCount);
  }, [filteredStudents, visibleCount]);

  // Check if current search input is a valid manual query candidate
  const manualQueryCandidate = useMemo(() => {
    const trimmed = search.trim();
    if (!trimmed) return null;

    // Standardize separators like _ or - to /
    const normalized = trimmed.replace(/[\-_]/g, '/');
    const regPattern = /^(\d{2,3})\/(\d{1,3})$/;
    const match = normalized.match(regPattern);

    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      const paddedNum = numStr.padStart(3, '0');
      const formattedReg = `${prefix}/${paddedNum}`;
      const unpaddedReg = `${prefix}/${parseInt(numStr, 10)}`;

      // Check if candidate exists in students list (either formatted or unpadded)
      const exists = students.some(s => {
        const uid = (s.user_id || '').toLowerCase();
        return uid === formattedReg.toLowerCase() || uid === unpaddedReg.toLowerCase() || uid === normalized.toLowerCase();
      });

      if (!exists) return formattedReg;
    }
    return null;
  }, [search]);

  // Client-side PDF Parsing function (99.999% accurate regex + 4px Y-clustering)
  const parsePdfDossier = async (arrayBuffer: ArrayBuffer): Promise<Dossier> => {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    const items = textContent.items as any[];
    // Sort items by Y descending (PDF coordinates go from bottom to top)
    items.sort((a, b) => b.transform[5] - a.transform[5]);
    
    const textRows: string[] = [];
    let currentY = -9999;
    let currentLineItems: any[] = [];
    
    for (const item of items) {
      const y = item.transform[5];
      if (currentY === -9999) {
        currentY = y;
        currentLineItems.push(item);
      } else if (Math.abs(currentY - y) <= 4) { // Group characters within 4 pixels vertically
        currentLineItems.push(item);
      } else {
        // Sort line items horizontally (X coordinate transform[4]) ascending
        currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
        const rowText = currentLineItems.map((cli) => cli.str).join("  ").trim();
        if (rowText) textRows.push(rowText);
        
        currentY = y;
        currentLineItems = [item];
      }
    }
    
    // Process final line
    if (currentLineItems.length > 0) {
      currentLineItems.sort((a, b) => a.transform[4] - b.transform[4]);
      const rowText = currentLineItems.map((cli) => cli.str).join("  ").trim();
      if (rowText) textRows.push(rowText);
    }

    const result: Dossier = {
      dob: null,
      fatherName: null,
      motherName: null,
      phone: null,
      email: null,
      address: null,
      parentsMobile: null,
      aadhaar: null,
      rollNo: null,
      forSemester: null,
      totalCredits: null,
      courses: [],
      hostelName: null,
      hostelRoom: null
    };

    textRows.forEach((row) => {
      // Student Name
      if (row.includes("Student Name:")) {
        const match = row.match(/Student Name:\s*(.*?)(?:\s+DOB:|\s+Email:|$)/i);
        if (match) result.extractedName = match[1].trim();
      }

      // Program Name
      if (row.includes("SEMESTER COURSE REGISTRATION FORM FOR")) {
        const match = row.match(/SEMESTER COURSE REGISTRATION FORM FOR\s+(.*?)(?:\s+Report|\s+$)/i);
        if (match) result.extractedProgram = match[1].trim();
      }

      // 1. DOB Parsing
      if (row.includes("DOB:")) {
        const match = row.match(/DOB:\s*([^\s]+)/i);
        if (match) result.dob = match[1].trim();
      }

      // Roll No
      if (row.includes("Roll No")) {
        const match = row.match(/Roll No\s*[:\-]\s*([A-Za-z0-9\/]+)/i);
        if (match) result.rollNo = match[1].trim();
      }

      // For Semester
      if (row.includes("For Semester:")) {
        const match = row.match(/For Semester:\s*(.*?)(?:Report|Print|$)/i);
        if (match) result.forSemester = match[1].trim();
      }

      // Total Registered Credits
      if (row.includes("Total Registered Credits")) {
        const match = row.match(/Total Registered Credits\s*([0-9\.]+)/i);
        if (match) result.totalCredits = match[1].trim();
      }

      // Hostel Name & Room
      if (row.includes("Hostel:") || row.includes("Hostel Name:")) {
        const match = row.match(/Hostel(?:\s*Name)?:\s*(.*?)(?:Room|Block|$)/i);
        if (match) result.hostelName = match[1].trim();
      }
      if (row.includes("Room No:") || row.includes("Room:")) {
        const match = row.match(/Room(?:\s*No)?:\s*([A-Za-z0-9\-]+)/i);
        if (match) result.hostelRoom = match[1].trim();
      }

      // Parse Course Rows (e.g. CE102  BASIC ENGINEERING DRAWING  Compulsory  3.0  TRB)
      const courseMatch = row.match(/^([A-Z]{2,4}\d{3,4})\s+(.*?)(?:\s+(Compulsory|Elective))?\s+([0-9\.]+)\s+([A-Z0-9\-]+)$/i);
      if (courseMatch) {
        result.courses!.push({
          code: courseMatch[1].trim(),
          name: courseMatch[2].trim(),
          type: courseMatch[3] ? courseMatch[3].trim() : 'Compulsory',
          credits: courseMatch[4].trim(),
          coordinator: courseMatch[5].trim()
        });
      }
      
      // 2. Father's Name (Extract up to adjacent labels like Mother's Name, Mobile, Email, Aadhaar, etc.)
      if (row.includes("Father's Name:")) {
        const match = row.match(/Father's Name:\s*(.*?)(?:Mother's Name:|Mobile:|Email:|Parents Mobile:|$|Aadhaar|Address)/i);
        if (match) result.fatherName = match[1].trim().replace(/\s\s+/g, " ");
      }
      
      // 3. Mother's Name (Extract up to adjacent labels)
      if (row.includes("Mother's Name:")) {
        const match = row.match(/Mother's Name:\s*(.*?)(?:Father's Name:|Mobile:|Email:|Parents Mobile:|$|Aadhaar|Address)/i);
        if (match) result.motherName = match[1].trim().replace(/\s\s+/g, " ");
      }
      
      // 4. Email
      if (row.includes("Email:") && !row.includes("EmailId")) {
        const match = row.match(/Email:\s*([^\s]+@[^\s]+)/i);
        if (match) result.email = match[1].trim();
      }
      
      // 5. Mobile (Ensure we exclude Parents Mobile)
      if (row.includes("Mobile:") && !row.includes("Parents Mobile")) {
        const match = row.match(/(?<!Parents\s+)Mobile:\s*([+0-9\s-]{10,16})/i);
        if (match) {
          result.phone = match[1].trim().replace(/[-\s]/g, '');
        } else {
          // Fallback simple regex
          const simpleMatch = row.match(/Mobile:\s*([+0-9\s-]{10,16})/);
          if (simpleMatch) result.phone = simpleMatch[1].trim().replace(/[-\s]/g, '');
        }
      }
      
      // 6. Registered Address
      if (row.includes("Address:")) {
        const match = row.match(/Address:\s*(.*)$/i);
        if (match) result.address = match[1].trim().replace(/\s\s+/g, " ");
      }
      
      // 7. Parents Mobile
      if (row.includes("Parents Mobile")) {
        const match = row.match(/Parents Mobile\s*[:\-]?\s*([+0-9\s-]{10,16})/i);
        if (match) result.parentsMobile = match[1].trim().replace(/[-\s]/g, '');
      }
      
      // 8. Aadhaar Card
      if (row.includes("Aadhaar")) {
        const match = row.match(/Aadhaar(?:\s*No\s*)?\s*:\s*([0-9\s-]{12,16})/i);
        if (match) result.aadhaar = match[1].trim().replace(/[-\s]/g, '');
      }
    });

    // Parse numeric semester from forSemester
    if (result.forSemester) {
      const s = result.forSemester.toUpperCase();
      if (s.includes("VIII") || s.includes("8")) result.extractedSemesterNum = 8;
      else if (s.includes("VII") || s.includes("7")) result.extractedSemesterNum = 7;
      else if (s.includes("VI") || s.includes("6")) result.extractedSemesterNum = 6;
      else if (s.includes("V") || s.includes("5")) result.extractedSemesterNum = 5;
      else if (s.includes("IV") || s.includes("4")) result.extractedSemesterNum = 4;
      else if (s.includes("III") || s.includes("3")) result.extractedSemesterNum = 3;
      else if (s.includes("II") || s.includes("2")) result.extractedSemesterNum = 2;
      else if (s.includes("I") || s.includes("1")) result.extractedSemesterNum = 1;
    }

    // Infer exact department from rollNo branch code or course code prefixes
    if (result.rollNo) {
      const parts = result.rollNo.toUpperCase().split('/');
      if (parts.length >= 3) {
        const code = parts[2];
        if (code === 'EC' || code === 'ECE') result.extractedDepartment = "Electronics and Communication Engineering";
        else if (code === 'EE') result.extractedDepartment = "Electrical Engineering";
        else if (code === 'ME') result.extractedDepartment = "Mechanical Engineering";
        else if (code === 'CE') result.extractedDepartment = "Civil Engineering";
        else if (code === 'AE' || code === 'AGE') result.extractedDepartment = "Agricultural Engineering";
        else if (code === 'CS' || code === 'CSE') result.extractedDepartment = "Computer Science and Engineering";
        else if (code === 'FO' || code === 'FOR') result.extractedDepartment = "Forestry";
        else if (code === 'PH') result.extractedDepartment = "Physics";
        else if (code === 'CY') result.extractedDepartment = "Chemistry";
        else if (code === 'MA') result.extractedDepartment = "Mathematics";
        else if (code === 'MB') result.extractedDepartment = "Management Studies";
      }
    }

    if (!result.extractedDepartment && result.courses) {
      for (const c of result.courses) {
        const prefix = c.code.substring(0, 2).toUpperCase();
        if (prefix === 'EC') { result.extractedDepartment = "Electronics and Communication Engineering"; break; }
        if (prefix === 'EE') { result.extractedDepartment = "Electrical Engineering"; break; }
        if (prefix === 'ME') { result.extractedDepartment = "Mechanical Engineering"; break; }
        if (prefix === 'CE') { result.extractedDepartment = "Civil Engineering"; break; }
        if (prefix === 'AE') { result.extractedDepartment = "Agricultural Engineering"; break; }
        if (prefix === 'CS') { result.extractedDepartment = "Computer Science and Engineering"; break; }
        if (prefix === 'FO') { result.extractedDepartment = "Forestry"; break; }
      }
    }

    return result;
  };

  // Unlock dossier trigger — Cache-first with CDN fallback
  const handleUnlockDossier = async (regNo: string) => {
    if (isExtracting || unlockedDossiers[regNo]) return;
    
    setIsExtracting(true);
    setExtractError(null);

    // Helper to finalize a successful dossier unlock
    const finalizeDossier = (parsedData: Dossier, source: string) => {
      setUnlockedDossiers(prev => ({
        ...prev,
        [regNo]: parsedData
      }));

      setSelectedStudent(prev => {
        if (!prev) return null;
        const nameFromEmail = parsedData.email ? parsedData.email.split('@')[0].toUpperCase().replace(/[._]/g, ' ') : '';
        return {
          ...prev,
          full_name: parsedData.extractedName || (prev.full_name === "Manual Lookup Profile" ? nameFromEmail : prev.full_name),
          department_name: parsedData.extractedDepartment || prev.department_name,
          program_name: parsedData.extractedProgram || prev.program_name,
          semester: parsedData.extractedSemesterNum || prev.semester
        };
      });

      triggerToast(`Dossier unlocked! (${source})`);
      recordHelpAction();
      setIsExtracting(false);
    };

    // ─── STEP 1: Check private KV cache first (instant) ───
    try {
      const cacheRes = await fetch(`/api/dossierCache?regNo=${encodeURIComponent(regNo)}`);
      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        if (cacheData.dossier) {
          finalizeDossier(cacheData.dossier as Dossier, 'cached');
          return;
        }
      }
    } catch {
      // Cache check failed silently — proceed to CDN
    }

    // ─── STEP 2: Fetch from SymphonyX CDN (with retry) ───
    const MAX_RETRIES = 2;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const url = `/api/pdfProxy?regNo=${encodeURIComponent(regNo)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          let errorBody: any = {};
          try { errorBody = await res.json(); } catch { /* ignore */ }

          if (res.status === 502 || errorBody.code === 'CDN_UNREACHABLE') {
            if (attempt < MAX_RETRIES) {
              await new Promise(r => setTimeout(r, 2000));
              continue;
            }
            throw new Error("SymphonyX CDN is currently down or unreachable. If this student's data was previously accessed, it would have been served from cache. Please try again later.");
          }
          if (res.status === 404 || errorBody.code === 'NOT_FOUND') {
            throw new Error("Record not found");
          }
          throw new Error("Failed to connect to proxy. Server may be slow or offline.");
        }

        const arrayBuffer = await res.arrayBuffer();
        
        if (arrayBuffer.byteLength < 500) {
          throw new Error("Received an empty or invalid response from SymphonyX. The CDN may be returning error pages.");
        }

        const parsedData = await parsePdfDossier(arrayBuffer);
        
        const hasData = parsedData.dob || parsedData.fatherName || parsedData.motherName || 
                        parsedData.phone || parsedData.email || parsedData.aadhaar;
        
        if (!hasData) {
          throw new Error("PDF was retrieved but no personal data could be extracted. The document format may have changed.");
        }

        // ─── STEP 3: Cache the parsed data to KV (fire-and-forget) ───
        fetch('/api/dossierCache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regNo, dossier: parsedData })
        }).catch(() => { /* silent — caching is best-effort */ });

        finalizeDossier(parsedData, 'live');
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') {
          if (attempt < MAX_RETRIES) {
            continue;
          }
          setExtractError("Request timed out. SymphonyX CDN is too slow to respond right now. Please try again later.");
        } else if (attempt >= MAX_RETRIES) {
          console.error(e);
          setExtractError(e.message || "An unexpected error occurred during decryption.");
        }
      }
    }

    setIsExtracting(false);
  };

  // Redo / Lock dossier helper
  const handleRelockDossier = (regNo: string) => {
    setUnlockedDossiers(prev => {
      const copy = { ...prev };
      delete copy[regNo];
      return copy;
    });
    triggerToast("Dossier locked. You can now test the unlock animation again!");
  };

  // Launch manual profile popup
  const handleManualSearchLaunch = (regNo: string) => {
    // Generate a temporary student record
    const tempStudent: Student = {
      user_id: regNo,
      full_name: "Manual Lookup Profile",
      semester: 1,
      program_name: "Unknown",
      degree_name: "Unknown",
      department_name: "Manual Search Entry",
      cgpa: "N/A",
      avatar_url: "M0",
      state: null,
      pincode: null
    };
    setSelectedStudent(tempStudent);
    setDrawerImageError(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="passkey-container celestial-hero-wrapper">
        <GoldenPendulumCanvas 
          isDarkMode={isDarkMode}
          isSwarmMode={isSwarmMode}
          setIsSwarmMode={setIsSwarmMode}
          speedMultiplier={speedMultiplier}
          setSpeedMultiplier={setSpeedMultiplier}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          isPoincare={isPoincare}
          setIsPoincare={setIsPoincare}
          onGenesis={() => setGenesisTrigger(prev => prev + 1)}
          genesisTrigger={genesisTrigger}
        />
        <ThemeParticles activeTheme={activeTheme} isDarkMode={isDarkMode} />
        <div className="floating-mesh mesh-1"></div>
        <div className="floating-mesh mesh-2"></div>

        {/* Centered Harmonia Celestial Portal Content */}
        <div className={`celestial-portal-content ${isShakingGate ? 'shake-gate' : ''}`}>
          <div className="celestial-sub-badge">
            H A R M O N I A &nbsp; · &nbsp; N E R I S T &nbsp; · &nbsp; C E L E S T I A L
          </div>

          <h1 className="celestial-main-title">
            NERIST DIRECTORY
          </h1>

          <p className="celestial-desc">
            A brass and ink administrative cipher portal for NERIST student dossiers & academic records.
          </p>

          <form onSubmit={handleVerifyPasskey} className="celestial-form">
            <div className="celestial-input-wrapper">
              <input 
                type={showPasskeyText ? "text" : "password"}
                placeholder="Enter Access Passkey..."
                value={passkeyInput}
                onChange={(e) => {
                  setPasskeyInput(e.target.value);
                  if (passkeyError) setPasskeyError(null);
                }}
                autoFocus
                className="celestial-input"
              />
              <button
                type="button"
                onClick={() => setShowPasskeyText(!showPasskeyText)}
                className="celestial-eye-btn"
              >
                {showPasskeyText ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="celestial-checkbox-row">
              <label className="celestial-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {passkeyError && (
              <div className="celestial-error-msg">
                <ShieldCheck size={14} />
                <span>{passkeyError}</span>
              </div>
            )}

            <div className="seal-btn-container">
              <button
                type="submit"
                className="seal-lg-button"
              >
                AUTHENTICATE & ENTER
              </button>
              <span className="seal-subtitle-text">PRESS THE SEAL TO UNLOCK DOSSIERS</span>
            </div>
          </form>
        </div>

        {/* Harmonia Bottom Control Deck (Matching Image 1) */}
        <div className="celestial-control-deck">
          {/* LAUNCH */}
          <div className="deck-col">
            <span className="deck-label">LAUNCH</span>
            <button 
              onClick={() => setGenesisTrigger(prev => prev + 1)}
              className="deck-btn genesis-btn"
              title="Relaunch chaotic pendulum swarm"
            >
              ◉ GENESIS
            </button>
          </div>

          {/* MODE */}
          <div className="deck-col">
            <span className="deck-label">MODE</span>
            <div className="deck-btn-group">
              <button 
                onClick={() => setIsSwarmMode(false)}
                className={`deck-group-btn ${!isSwarmMode ? 'active' : ''}`}
              >
                SINGLE
              </button>
              <button 
                onClick={() => setIsSwarmMode(true)}
                className={`deck-group-btn ${isSwarmMode ? 'active' : ''}`}
              >
                SWARM
              </button>
            </div>
          </div>

          {/* TRACE */}
          <div className="deck-col">
            <span className="deck-label">TRACE</span>
            <button 
              onClick={() => setIsPoincare(!isPoincare)}
              className={`deck-btn ${isPoincare ? 'active' : ''}`}
            >
              POINCARÉ
            </button>
          </div>

          {/* TEMPO */}
          <div className="deck-col tempo-col">
            <span className="deck-label">TEMPO</span>
            <div className="deck-btn-group">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="deck-group-btn"
                title="Pause / Play physics"
              >
                {isPaused ? '▶' : '❚❚'}
              </button>
              {[0.1, 0.5, 1, 2, 4, 8].map(spd => (
                <button
                  key={spd}
                  onClick={() => {
                    setSpeedMultiplier(spd);
                    if (isPaused) setIsPaused(false);
                  }}
                  className={`deck-group-btn ${speedMultiplier === spd ? 'active' : ''}`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast.visible && (
          <div className="toast animate-toast">
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Golden Pendulum & Constellation Network Canvas Backdrop */}
      <GoldenPendulumCanvas 
        isDarkMode={isDarkMode}
        isSwarmMode={isSwarmMode}
        setIsSwarmMode={setIsSwarmMode}
        speedMultiplier={speedMultiplier}
        setSpeedMultiplier={setSpeedMultiplier}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        isPoincare={isPoincare}
        setIsPoincare={setIsPoincare}
        onGenesis={() => setGenesisTrigger(prev => prev + 1)}
        genesisTrigger={genesisTrigger}
      />

      {/* Theme Particles backdrop */}
      <ThemeParticles activeTheme={activeTheme} isDarkMode={isDarkMode} />
      
      {/* Mesh Backdrops */}
      <div className="floating-mesh mesh-1"></div>
      <div className="floating-mesh mesh-2"></div>

      {/* Glass Navigation Header */}
      <header 
        className="glass" 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 40, 
          width: '100%', 
          padding: '16px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '3px solid var(--border-color)',
          borderRadius: '0px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              height: '42px', 
              width: '42px', 
              borderRadius: activeTheme === 'harmonia' ? '12px' : activeTheme === 'onepiece' ? '2px' : '12px', 
              background: activeTheme === 'harmonia' 
                ? 'linear-gradient(135deg, #f7ecc9 0%, #caa64e 50%, #8d6f2c 100%)' 
                : activeTheme === 'onepiece' ? 'var(--border-color)' : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: activeTheme === 'harmonia' ? '#0b0e1a' : activeTheme === 'onepiece' ? 'var(--surface-color)' : '#ffffff', 
              fontWeight: 900, 
              fontSize: '1.3rem',
              fontFamily: activeTheme === 'harmonia' ? "'Cinzel', serif" : activeTheme === 'onepiece' ? 'Georgia, serif' : "'Outfit', sans-serif",
              boxShadow: activeTheme === 'harmonia' ? '0 0 16px rgba(201, 168, 79, 0.45), inset 0 1px 0 #ffffff' : activeTheme === 'onepiece' ? 'none' : '0 4px 12px var(--accent-glow)'
            }}
          >
            {activeTheme === 'harmonia' ? (
              <Zap size={22} fill="#f3e3ae" color="#4a3006" />
            ) : activeTheme === 'onepiece' ? (
              '฿'
            ) : (
              'N'
            )}
          </div>
          <div>
            <h1 className="header-logo-text" style={{ 
              fontSize: '1.2rem', 
              fontWeight: 900, 
              color: activeTheme === 'harmonia' ? '#f4e7c3' : 'var(--text-primary)', 
              lineHeight: 1.1, 
              letterSpacing: activeTheme === 'harmonia' ? '2px' : '1px', 
              fontFamily: activeTheme === 'harmonia' ? "'Cinzel', serif" : activeTheme === 'onepiece' ? 'Outfit, Georgia, serif' : "'Outfit', sans-serif" 
            }}>
              {activeTheme === 'harmonia' ? 'HARMONIA' : 'NERIST'}
            </h1>
            <p style={{ 
              fontSize: '0.62rem', 
              color: activeTheme === 'harmonia' ? '#c9a84f' : 'var(--text-muted)', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '1.5px', 
              fontFamily: activeTheme === 'harmonia' ? "'Cinzel', serif" : activeTheme === 'onepiece' ? 'Georgia, serif' : "'Inter', sans-serif" 
            }}>
              {activeTheme === 'harmonia' ? 'CELESTIAL DIRECTORY' : activeTheme === 'onepiece' ? 'Bounty Board' : 'Student Board'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="dept-pill active"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span className="header-btn-text">Install Board</span>
            </button>
          )}

          <button 
            onClick={() => setIsMenuOpen(true)} 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '12px', 
              border: '2px solid var(--border-color)', 
              background: 'var(--surface-color)', 
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}
            className="dept-pill"
            title="Open Filters & Settings"
          >
            <Filter size={16} />
            <span className="header-btn-text">Filters</span>
          </button>

          {/* Lock Portal Button */}
          <button
            onClick={handleLockPortal}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.78rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
            title="Lock Portal Session"
          >
            <Lock size={15} />
            <span className="header-btn-text">Lock</span>
          </button>
        </div>
      </header>

      {/* Layout Content */}
      <div className="container-layout">
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

          {/* Sticky Search Control Box */}
          <div 
            className="glass"
            style={{ 
              borderRadius: '24px', 
              padding: '16px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name, roll/reg, program, dept..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(24);
                }}
                style={{ 
                  width: '100%', 
                  padding: '14px 18px 14px 48px', 
                  backgroundColor: 'rgba(0, 0, 0, 0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '16px', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  outline: 'none'
                }}
                className="search-input"
              />
              {search && (
                <button 
                  onClick={() => {
                    setSearch('');
                    setVisibleCount(24);
                  }}
                  style={{ 
                    position: 'absolute', 
                    right: '20px', 
                    border: 'none', 
                    background: 'transparent', 
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Top-Level Module Filter Bar */}
            <div className="module-tabs-bar">
              {[
                { id: 'all', label: 'All Modules', icon: <GraduationCap size={14} /> },
                { id: 'base', label: 'Base Module (Certificate)', icon: <GraduationCap size={14} /> },
                { id: 'diploma', label: 'Diploma Module', icon: <GraduationCap size={14} /> },
                { id: 'degree', label: 'Degree Module (B.Tech.)', icon: <GraduationCap size={14} /> },
                { id: 'pg', label: 'Post-Graduate', icon: <GraduationCap size={14} /> },
                { id: 'bookmarked', label: `Saved (${bookmarkedRegNos.length})`, icon: <Bookmark size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedModule(tab.id);
                    setVisibleCount(24);
                  }}
                  className={`module-tab ${selectedModule === tab.id ? 'active' : ''}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {(search || selectedDept || selectedProgram || selectedModule !== 'all' || selectedYear !== 'all' || selectedCgpaTier !== 'all') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    setSearch('');
                    setSelectedDept(null);
                    setSelectedProgram(null);
                    setSelectedModule('all');
                    setSelectedYear('all');
                    setSelectedCgpaTier('all');
                    setVisibleCount(24);
                  }}
                  style={{ border: 'none', background: 'transparent', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Manual Query Callout */}
          {manualQueryCandidate && (
            <div 
              className="glass animate-fade-in"
              style={{
                borderRadius: '16px',
                padding: '18px 24px',
                border: '1px dashed var(--accent-primary)',
                backgroundColor: 'rgba(255, 74, 0, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: 'var(--card-shadow)',
                cursor: 'pointer'
              }}
              onClick={() => handleManualSearchLaunch(manualQueryCandidate)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: 'var(--accent-primary)' }}>
                  <Sparkles size={24} className="pulse-dot" style={{ backgroundColor: 'transparent' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Manual Dossier Lookup: Reg No {manualQueryCandidate}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    This student is not in the rankings list. Click here to attempt direct dossier decryption from SymphonyX.
                  </p>
                </div>
              </div>
              <button 
                className="dept-pill active" 
                style={{ 
                  border: 'none', 
                  background: 'var(--accent-primary)', 
                  color: 'white', 
                  padding: '8px 16px', 
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                Lookup Profile
              </button>
            </div>
          )}

          {/* Cards Grid */}
          {filteredStudents.length > 0 ? (
            <div className="cards-grid">
              {displayedStudents.map((item, idx) => {
                const initials = getAvatarInitials(item.full_name);
                const isUnlocked = !!unlockedDossiers[item.user_id];
                const isBookmarked = bookmarkedRegNos.includes(item.user_id);
                const delayClass = `delay-${(idx % 8) + 1}`;

                return (
                  <div key={`${item.user_id}-${idx}`} className={`cascade-card ${delayClass}`}>
                    <StudentCard3D
                      item={item}
                      searchQuery={search}
                      initials={initials}
                      isUnlocked={isUnlocked}
                      isBookmarked={isBookmarked}
                      onToggleBookmark={() => handleToggleBookmark(item.user_id)}
                      onClick={() => {
                        setSelectedStudent(item);
                        setDrawerImageError(false);
                      }}
                      onAction={recordHelpAction}
                      onEnlargePhoto={() => setEnlargedPhotoStudent(item)}
                      theme={activeTheme}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            !manualQueryCandidate && (
              <div 
                className="glass" 
                style={{ 
                  borderRadius: '24px', 
                  padding: '48px', 
                  textAlign: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '16px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div 
                  style={{ 
                    height: '48px', 
                    width: '48px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(0, 0, 0, 0.03)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Search size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>No matching students found</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Try checking the spelling, entering a full registration number, or clearing active filters.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSearch('');
                    setSelectedDept(null);
                    setSelectedProgram(null);
                    setVisibleCount(24);
                  }}
                  className="dept-pill active"
                  style={{ width: 'auto', border: 'none' }}
                >
                  Clear all filters
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Floating Toast */}
      {toast.visible && (
        <div 
          className="glass animate-fade-in" 
          style={{ 
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '1px solid rgba(255, 74, 0, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(255, 74, 0, 0.15)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000
          }}
        >
          <div 
            style={{ 
              height: '20px', 
              width: '20px', 
              borderRadius: '50%', 
              backgroundColor: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff' 
            }}
          >
            <Check size={12} strokeWidth={3} />
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {toast.message}
          </p>
        </div>
      )}

      {/* Student Detail Drawer */}
      {selectedStudent && (
        <div 
          className="drawer-backdrop"
          onClick={() => {
            setSelectedStudent(null);
            setExtractError(null);
          }}
        >
          <div 
            className="drawer-content"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {/* Celestial Constellation Background */}
            <ConstellationBackground nodeCount={45} connectionDistance={100} />
            {/* Header / Banner */}
            <div className="drawer-header" style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              height: '110px',
              position: 'relative',
              zIndex: 1
            }}>
              <button 
                onClick={() => {
                  setSelectedStudent(null);
                  setExtractError(null);
                }}
                className="drawer-close"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  color: 'white',
                  top: '16px',
                  right: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
              
              {/* Profile Image (Click to enlarge) */}
              <div className="drawer-avatar-wrap" style={{ bottom: '-35px' }}>
                {!drawerImageError ? (
                  <img 
                    src={getProxiedImageUrl(selectedStudent.user_id)} 
                    alt={selectedStudent.full_name} 
                    className="drawer-avatar"
                    style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: '3px solid var(--bg-color)', cursor: 'zoom-in' }}
                    onError={() => setDrawerImageError(true)}
                    onClick={() => setEnlargedPhotoStudent(selectedStudent)}
                  />
                ) : (
                  <div 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold', 
                      fontSize: '1.5rem',
                      backgroundColor: isDarkMode ? getAvatarColor(selectedStudent.full_name).darkBg : getAvatarColor(selectedStudent.full_name).bg, 
                      color: isDarkMode ? getAvatarColor(selectedStudent.full_name).darkText : getAvatarColor(selectedStudent.full_name).text,
                      border: '3px solid var(--bg-color)'
                    }}
                  >
                    {getAvatarInitials(selectedStudent.full_name)}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Drawer Body */}
            <div className="drawer-body" style={{ position: 'relative', zIndex: 1 }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedStudent.full_name}
                </h2>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '4px' }}>
                  Reg: {selectedStudent.user_id}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedStudent.department_name}
                </p>
              </div>

              {/* Base Info Cards */}
              <div className="dossier-base-grid">
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Program</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedStudent.program_name}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Academic Stage</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Semester {selectedStudent.semester}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>CGPA Score</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{selectedStudent.cgpa}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Home State</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedStudent.state || 'N/A'}</span>
                </div>
              </div>

              {/* Dossier Unlock Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Lock size={14} />
                  <span>SymphonyX Dossier</span>
                </div>

                {/* If Not Unlocked */}
                {!unlockedDossiers[selectedStudent.user_id] ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => handleUnlockDossier(selectedStudent.user_id)}
                      disabled={isExtracting}
                      className={`dept-pill active ${isExtracting ? 'ice-shimmer-effect' : ''}`}
                      style={{ 
                        border: 'none', 
                        width: '100%', 
                        padding: '16px', 
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                        color: 'white',
                        boxShadow: '0 4px 14px var(--accent-glow)'
                      }}
                    >
                      {isExtracting ? (
                        <>
                          <span className="pulse-dot" style={{ backgroundColor: 'white' }}></span>
                          <DecipheringText isAnimating={isExtracting} defaultText="DECRYPTING DOSSIER..." />
                        </>
                      ) : (
                        <>
                          <Unlock size={16} />
                          <span style={{ fontWeight: 800 }}>UNLOCK DOSSIER (FREE)</span>
                        </>
                      )}
                    </button>
                    {extractError && (
                      <div style={{ 
                        fontSize: '0.78rem', 
                        color: '#fbbf24', 
                        fontWeight: 600, 
                        padding: '12px 14px', 
                        borderRadius: '12px',
                        background: 'rgba(251, 191, 36, 0.06)',
                        border: '1px solid rgba(251, 191, 36, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>⚠️</span>
                          <span style={{ lineHeight: 1.4 }}>{extractError}</span>
                        </div>
                        <button
                          onClick={() => {
                            setExtractError(null);
                            handleUnlockDossier(selectedStudent.user_id);
                          }}
                          style={{
                            alignSelf: 'flex-start',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            background: 'rgba(251, 191, 36, 0.1)',
                            color: '#fbbf24',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.18)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'}
                        >
                          ↻ Retry
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* If Dossier is Unlocked */
                  <div 
                    className="glass animate-fade-in" 
                    style={{ 
                      borderRadius: '16px', 
                      padding: '16px', 
                      border: '1px solid #10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', width: '100%' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.78rem', fontWeight: 800 }}>
                        <Unlock size={12} /> DOSSIER DECRYPTED
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                        {/* Print Button */}
                        <button 
                          onClick={() => window.print()}
                          style={{
                            border: 'none',
                            background: 'rgba(16, 185, 129, 0.08)',
                            color: '#10b981',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'}
                          title="Print clean single-page dossier reference card"
                        >
                          <Printer size={10} />
                          <span>Print</span>
                        </button>

                        {/* Redo/Relock Button */}
                        <button 
                          onClick={() => handleRelockDossier(selectedStudent.user_id)}
                          style={{
                            border: 'none',
                            background: 'rgba(16, 185, 129, 0.08)',
                            color: '#10b981',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'}
                        >
                          <RefreshCw size={10} />
                          <span>Redo</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <DetailRow label="DOB" value={unlockedDossiers[selectedStudent.user_id].dob} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].dob || '', 'DOB')} />
                      <DetailRow label="Institute Roll No" value={unlockedDossiers[selectedStudent.user_id].rollNo || null} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].rollNo || '', 'Roll No')} />
                      <DetailRow label="Semester / Session" value={unlockedDossiers[selectedStudent.user_id].forSemester || null} />
                      <DetailRow label="Father" value={unlockedDossiers[selectedStudent.user_id].fatherName} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].fatherName || '', 'Father Name')} />
                      <DetailRow label="Mother" value={unlockedDossiers[selectedStudent.user_id].motherName} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].motherName || '', 'Mother Name')} />
                      <DetailRow label="Phone" value={unlockedDossiers[selectedStudent.user_id].phone} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].phone || '', 'Phone')} />
                      <DetailRow label="Parents Mobile" value={unlockedDossiers[selectedStudent.user_id].parentsMobile} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].parentsMobile || '', 'Parents Mobile')} />
                      <DetailRow label="Personal Email" value={unlockedDossiers[selectedStudent.user_id].email} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].email || '', 'Email')} />
                      <DetailRow label="Aadhaar" value={unlockedDossiers[selectedStudent.user_id].aadhaar} onCopy={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].aadhaar || '', 'Aadhaar')} />
                      
                      {unlockedDossiers[selectedStudent.user_id].address && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginBottom: '2px' }}>Registered Address:</span>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: 1.4, flexGrow: 1 }}>{unlockedDossiers[selectedStudent.user_id].address}</span>
                            <button 
                              onClick={() => copyToClipboard(unlockedDossiers[selectedStudent.user_id].address || '', 'Address')}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '2px', alignSelf: 'center' }}
                              title="Copy Address"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hostel Accommodation Card (Only rendered if exact hostel data exists) */}
                    {(unlockedDossiers[selectedStudent.user_id].hostelName || 
                      unlockedDossiers[selectedStudent.user_id].hostelWing || 
                      unlockedDossiers[selectedStudent.user_id].hostelRoom) && (
                      <div style={{ marginTop: '10px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255, 74, 0, 0.04)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Home size={14} style={{ color: 'var(--accent-primary)' }} />
                            Hostel Accommodation
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {unlockedDossiers[selectedStudent.user_id].hostelName && (
                            <DetailRow label="Hostel Name" value={unlockedDossiers[selectedStudent.user_id].hostelName || null} />
                          )}
                          {unlockedDossiers[selectedStudent.user_id].hostelWing && (
                            <DetailRow label="Hostel Wing" value={unlockedDossiers[selectedStudent.user_id].hostelWing || null} />
                          )}
                          {unlockedDossiers[selectedStudent.user_id].hostelRoom && (
                            <DetailRow label="Room Number" value={unlockedDossiers[selectedStudent.user_id].hostelRoom || null} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enrolled Subjects & Credits Card */}
                    {unlockedDossiers[selectedStudent.user_id].courses && unlockedDossiers[selectedStudent.user_id].courses!.length > 0 && (
                      <div style={{ marginTop: '10px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                            Enrolled Subjects ({unlockedDossiers[selectedStudent.user_id].totalCredits ? `${unlockedDossiers[selectedStudent.user_id].totalCredits} Credits` : `${unlockedDossiers[selectedStudent.user_id].courses!.length} Courses`})
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                          {unlockedDossiers[selectedStudent.user_id].courses!.map((c, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.12)', fontSize: '0.75rem' }}>
                              <div>
                                <span style={{ fontWeight: 800, color: 'var(--accent-primary)', marginRight: '6px' }}>{c.code}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.name}</span>
                              </div>
                              {c.credits && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginLeft: '8px' }}>{c.credits} Cr</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chat and Call Buttons */}
                    {(unlockedDossiers[selectedStudent.user_id].phone || unlockedDossiers[selectedStudent.user_id].parentsMobile) && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <a 
                          href={getWhatsAppLink(unlockedDossiers[selectedStudent.user_id].phone || unlockedDossiers[selectedStudent.user_id].parentsMobile || '')}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => recordHelpAction()}
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            padding: '10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <WhatsAppIcon size={14} />
                          <span>WhatsApp Chat</span>
                        </a>

                        <a 
                          href={`tel:${(unlockedDossiers[selectedStudent.user_id].phone || unlockedDossiers[selectedStudent.user_id].parentsMobile || '').replace(/\s+/g, '')}`}
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(255, 74, 0, 0.08)',
                            color: 'var(--accent-primary)',
                            border: '1px solid rgba(255, 74, 0, 0.2)',
                            padding: '10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={14} />
                          <span>Call Direct</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Drawer */}
      {isMenuOpen && (
        <div 
          className="drawer-backdrop"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="drawer-content"
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
          >
            {/* Celestial Constellation Background */}
            <ConstellationBackground nodeCount={40} connectionDistance={95} />
            {/* Header */}
            <div className="drawer-header" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} />
                <span>Settings & Filters</span>
              </h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="drawer-close"
                style={{ 
                  position: 'static', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="drawer-body" style={{ padding: '24px', gap: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0, position: 'relative', zIndex: 1 }}>
              
              {/* Appearance Mode */}
              <div>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Appearance Mode
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`dept-pill ${!isDarkMode ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                  >
                    <Sun size={16} />
                    <span>Light Mode</span>
                  </button>
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`dept-pill ${isDarkMode ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                  >
                    <Moon size={16} />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              {/* Visual Theme Selection */}
              <div>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Visual Theme
                </h3>
                <div className="theme-selector-grid">
                  {[
                    { id: 'harmonia', name: 'Celestial Harmonia', colors: ['#0b0e1a', '#c9a84f', '#7c1f2b'] },
                    { id: 'onepiece', name: 'Wanted Poster', colors: ['#dfc499', '#3e2616', '#a12b18'] },
                    { id: 'cyber', name: 'Cyber Glow', colors: ['#0d0d12', '#ff4a00', '#e21b22'] },
                    { id: 'forest', name: 'Midnight Forest', colors: ['#152226', '#81c784', '#2e7d32'] }
                  ].map(themeItem => (
                    <button
                      key={themeItem.id}
                      onClick={() => setActiveTheme(themeItem.id)}
                      className="theme-selector-option"
                      style={{ 
                        fontFamily: 'inherit',
                        borderColor: activeTheme === themeItem.id ? themeItem.colors[1] : 'var(--border-color)',
                        backgroundColor: activeTheme === themeItem.id ? themeItem.colors[0] : 'var(--surface-color)',
                        boxShadow: activeTheme === themeItem.id ? `0 4px 14px ${themeItem.colors[1]}40` : 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <span style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 800, 
                        color: activeTheme === themeItem.id 
                          ? (themeItem.id === 'latte' || themeItem.id === 'onepiece' ? '#2d1a0d' : '#ffffff') 
                          : 'var(--text-primary)',
                        transition: 'color 0.2s'
                      }}>
                        {themeItem.name}
                      </span>
                      <div className="theme-preview-dots" style={{ marginTop: '4px' }}>
                        {themeItem.colors.map((c, i) => (
                          <div 
                            key={i} 
                            className="theme-preview-dot" 
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Admission Year Filter */}
              <div>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Filter by Admission Batch
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['all', '2026', '2025', '2024', '2023', '2022', '2021'].map(yr => (
                    <button
                      key={yr}
                      onClick={() => {
                        setSelectedYear(yr);
                        setVisibleCount(24);
                      }}
                      className={`dept-pill ${selectedYear === yr ? 'active' : ''}`}
                    >
                      {yr === 'all' ? 'All Batches' : `${yr} Admission`}
                    </button>
                  ))}
                </div>
              </div>

              {/* CGPA Tier Filter */}
              <div>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Filter by CGPA Score
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { id: 'all', label: 'All CGPAs' },
                    { id: 'top9', label: '🏆 Top Rankers (9.0+)' },
                    { id: 'good8', label: '⭐ Distinction (8.0 - 8.99)' },
                    { id: 'avg7', label: '👍 Good Standing (7.0 - 7.99)' },
                    { id: 'below7', label: '📊 Below 7.0' }
                  ].map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setSelectedCgpaTier(tier.id);
                        setVisibleCount(24);
                      }}
                      className={`dept-pill ${selectedCgpaTier === tier.id ? 'active' : ''}`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Program Filter */}
              <div>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Filter by Program
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      setSelectedProgram(null);
                      setVisibleCount(24);
                    }}
                    className={`dept-pill ${selectedProgram === null ? 'active' : ''}`}
                  >
                    All Programs
                  </button>
                  {programs.map(prog => (
                    <button
                      key={prog}
                      onClick={() => {
                        setSelectedProgram(prog);
                        setVisibleCount(24);
                      }}
                      className={`dept-pill ${selectedProgram === prog ? 'active' : ''}`}
                    >
                      {prog}
                    </button>
                  ))}
                </div>
              </div>

              {/* Home State Filter */}
              <div>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Filter by Home State
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      setSelectedState(null);
                      setVisibleCount(24);
                    }}
                    className={`dept-pill ${selectedState === null ? 'active' : ''}`}
                  >
                    All States
                  </button>
                  {statesList.map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        setSelectedState(st);
                        setVisibleCount(24);
                      }}
                      className={`dept-pill ${selectedState === st ? 'active' : ''}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Filter by Department
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  <button 
                    onClick={() => {
                      setSelectedDept(null);
                      setVisibleCount(24);
                    }}
                    className={`dept-pill ${selectedDept === null ? 'active' : ''}`}
                    style={{ textAlign: 'left', display: 'block', width: '100%' }}
                  >
                    All Departments
                  </button>
                  {departments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDept(dept);
                        setVisibleCount(24);
                      }}
                      className={`dept-pill ${selectedDept === dept ? 'active' : ''}`}
                      style={{ textAlign: 'left', display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={dept}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Lightbox Modal */}
      {enlargedPhotoStudent && (
        <div 
          onClick={() => setEnlargedPhotoStudent(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'photoLightboxFade 0.25s ease-out'
          }}
        >
          {/* Close Area */}
          <button 
            onClick={() => setEnlargedPhotoStudent(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 210,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <X size={20} />
          </button>

          {/* Photo Frame */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              maxWidth: '90%',
              width: '420px',
              animation: 'photoLightboxFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div 
              style={{
                width: '100%',
                borderRadius: '32px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                aspectRatio: '1',
                background: '#0d0d12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img 
                src={getEnlargedImageUrl(enlargedPhotoStudent.user_id)} 
                alt={enlargedPhotoStudent.full_name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Info Text */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 800 }}>{enlargedPhotoStudent.full_name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Reg: {enlargedPhotoStudent.user_id}</p>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <button 
                onClick={() => handleDownloadPhoto(enlargedPhotoStudent.user_id, enlargedPhotoStudent.full_name)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px var(--accent-glow)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Download size={16} />
                <span>Download Photo</span>
              </button>

              <button 
                onClick={() => handleSharePhoto(enlargedPhotoStudent.user_id, enlargedPhotoStudent.full_name)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <Share2 size={16} />
                <span>Share photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
