// frontend/src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Search,
  ChevronRight,
  Calendar as CalIcon,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Star,
  ChevronLeft,
  SlidersHorizontal,
  X,
  AlertTriangle,
  Wrench,
  BarChart3,
  Mail,
  Lock,
  Camera,
  Check,
  Info,
} from "lucide-react";
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { Eye, EyeOff } from "lucide-react";


async function getAuthUser() {
  try {
    const user = await getCurrentUser();
    const attrs = await fetchUserAttributes();
    return { username: user.username, sub: attrs.sub, email: attrs.email };
  } catch {
    return null;
  }
}



/**
 * =========================
 * Config
 * =========================
 */
const API_BASE = import.meta.env.VITE_API_BASE;

console.log("[PutraServe] API_BASE =", API_BASE);


/**
 * =========================
 * Tiny UI kit (Tailwind-only)
 * =========================
 */
function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Button({
  children,
  className,
  variant = "default",
  size = "md",
  type = "button",
  disabled,
  onClick,
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default:
      "bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-xl",
    outline:
      "border border-border bg-background hover:bg-muted rounded-xl",
    ghost:
      "bg-transparent hover:bg-muted rounded-xl",
    destructive:
      "bg-destructive text-destructive-foreground hover:opacity-90 rounded-xl",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-14 px-8 text-base rounded-2xl",
    icon: "h-10 w-10",
  };
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

function Badge({ children, variant = "secondary", className }) {
  const variants = {
    secondary: "bg-muted text-muted-foreground",
    outline: "border border-border bg-transparent",
    primary: "bg-primary text-primary-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

function Card({ children, className }) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl", className)}>
      {children}
    </div>
  );
}
function CardHeader({ children, className }) {
  return <div className={cn("p-6 pb-3", className)}>{children}</div>;
}
function CardTitle({ children, className }) {
  return <div className={cn("font-semibold text-lg", className)}>{children}</div>;
}
function CardContent({ children, className }) {
  return <div className={cn("p-6 pt-3", className)}>{children}</div>;
}

function EmptyState({ title, description, icon, action }) {
  return (
    <div className="text-center py-14">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-xl font-semibold">{title}</div>
      {description ? (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function RatingStars({ rating = 0, onChange, interactive = false, size = "md" }) {
  const px = size === "lg" ? 24 : size === "sm" ? 14 : 18;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onChange?.(i)}
          className={cn(
            "leading-none",
            interactive ? "cursor-pointer" : "cursor-default"
          )}
          aria-label={`Rate ${i}`}
        >
          <Star
            style={{ width: px, height: px }}
            className={cn(
              i <= rating ? "text-warning fill-warning" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * =========================
 * Layout (single-file)
 * =========================
 */
function Layout({ children, showFooter = true, authUser, onLogout }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* top nav */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
              PS
            </div>
            <div className="font-semibold">PutraServe</div>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/facilities">
              <Button variant="ghost" size="sm">Facilities</Button>
            </Link>
            <Link to="/bookings">
              <Button variant="ghost" size="sm">My Bookings</Button>
            </Link>
            {authUser ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {authUser.email}
                </span>
                <Button size="sm" variant="outline" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
               <Button size="sm">
                <Mail className="h-4 w-4" />
                Login
              </Button>
            </Link>
            )}
          </div>
        </div>
      </div>

      {children}

      {showFooter ? (
        <footer className="border-t border-border py-10 mt-12">
          <div className="container mx-auto px-4 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} PutraServe • UPM Serdang</span>
            <span>Facility Booking • Maintenance • Feedback</span>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

/**
 * =========================
 * Data model
 * (Venue → Facilities in venue)
 * =========================
 */
const CATEGORY_LABELS = {
  sports: "Sports",
  "study-room": "Study Room",
  hall: "Hall",
  lab: "Lab",
};

const DEMO_VENUES = [
  {
    id: "venue-psu",
    name: "Pusat Sukan UPM",
    location: "UPM Serdang",
    facilities: [
      {
        id: "fac-psu-pool",
        name: "Kolam Renang",
        category: "sports",
        capacity: 80,
        openingHours: "8:00 AM - 10:00 PM",
        price: 5,
        ratingAvg: 4.7,
        totalReviews: 120,
        description: "Olympic-size pool for training and recreation.",
        equipment: ["Shower", "Locker", "Lifeguard"],
        rules: ["Bring student ID", "Proper attire required"],
      },
      {
        id: "fac-psu-tennis",
        name: "Gelanggang Tenis",
        category: "sports",
        capacity: 4,
        openingHours: "8:00 AM - 10:00 PM",
        price: 0,
        ratingAvg: 4.6,
        totalReviews: 90,
        description: "Outdoor tennis court booking.",
        equipment: ["Net", "Lighting (night)"],
        rules: ["Max 2 hours per booking"],
      },
      {
        id: "fac-psu-badminton",
        name: "Gelanggang Badminton",
        category: "sports",
        capacity: 6,
        openingHours: "8:00 AM - 10:00 PM",
        price: 2,
        ratingAvg: 4.8,
        totalReviews: 200,
        description: "Indoor badminton court with anti-slip floor.",
        equipment: ["Net", "Bench", "Scoreboard"],
        rules: ["Indoor shoes required"],
      },
    ],
  },
  {
    id: "venue-library",
    name: "Perpustakaan Sultan Abdul Samad",
    location: "UPM Serdang",
    facilities: [
      {
        id: "fac-lib-br1",
        name: "Bilik Perbincangan 1",
        category: "study-room",
        capacity: 8,
        openingHours: "9:00 AM - 9:00 PM",
        price: 0,
        ratingAvg: 4.5,
        totalReviews: 65,
        description: "Quiet discussion room with whiteboard.",
        equipment: ["Whiteboard", "Wi-Fi", "Power sockets"],
        rules: ["Keep noise low", "No food"],
      },
      {
        id: "fac-lib-br2",
        name: "Bilik Perbincangan 2",
        category: "study-room",
        capacity: 10,
        openingHours: "9:00 AM - 9:00 PM",
        price: 0,
        ratingAvg: 4.4,
        totalReviews: 52,
        description: "Discussion room with projector.",
        equipment: ["Projector", "HDMI", "Wi-Fi"],
        rules: ["Return remote after use"],
      },
    ],
  },
];

/**
 * =========================
 * API wrapper 
 * =========================
 */
async function apiFetch(path, opts = {}) {
  if (!API_BASE) throw new Error("VITE_API_BASE is not set. Backend NOT connected.");

  const method = (opts.method || "GET").toUpperCase();

  const headers = {
    ...(opts.headers || {}),
  };

  // Only attach JSON content-type when sending a body
  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    method,
    headers,
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
let _venuesCache = null;

async function getVenuesCached() {
  if (!API_BASE) return DEMO_VENUES;
  if (_venuesCache) return _venuesCache;
  const venues = await apiFetch(`/venues`);
  _venuesCache = Array.isArray(venues) ? venues : [];
  return _venuesCache;
}

function flattenVenuesToFacilityMap(venues) {
  const map = new Map();
  for (const v of venues || []) {
    for (const f of v.facilities || []) {
      map.set(f.id, { ...f, venueName: v.name, venueId: v.id, location: v.location });
    }
  }
  return map;
}

const facilitiesApi = {
  async getVenues({ search = "", category = "all" } = {}) {
    // If backend exists, call it:
    if (API_BASE) {
      return apiFetch(`/venues?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
    }
    // Demo:
    const q = search.trim().toLowerCase();
    const filtered = DEMO_VENUES.map((v) => {
      const facilities = v.facilities.filter((f) => {
        const inCat = category === "all" ? true : f.category === category;
        const inSearch = q
          ? (f.name + " " + v.name + " " + v.location).toLowerCase().includes(q)
          : true;
        return inCat && inSearch;
      });
      return { ...v, facilities };
    }).filter((v) => v.facilities.length > 0);
    return filtered;
  },

  async getById(facilityId) {
  if (API_BASE) {
    // fetch venues then find facility inside them
    const venues = await apiFetch(`/venues`);
    for (const v of venues || []) {
      const f = (v.facilities || []).find((x) => x.id === facilityId);
      if (f) return { ...f, venueName: v.name, venueId: v.id, location: v.location };
    }
    return null;
  }

  // demo fallback
  for (const v of DEMO_VENUES) {
    const f = v.facilities.find((x) => x.id === facilityId);
    if (f) return { ...f, venueName: v.name, venueId: v.id, location: v.location };
  }
  return null;
},

  async getTimeSlots(facilityId, dateStr) {
    if (API_BASE) return apiFetch(`/facilities/${facilityId}/timeslots?date=${encodeURIComponent(dateStr)}`);
    // demo: 8 slots
    return [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "20:00 - 21:00",
    ].map((t, i) => ({ id: `slot-${i}`, time: t, available: true }));
  },

  async getFeedbacks(facilityId) {
    if (API_BASE) return apiFetch(`/facilities/${facilityId}/feedback`);
    return [
      { id: "fb-1", userName: "UPM Student", rating: 5, comment: "Nice and clean!" },
      { id: "fb-2", userName: "Staff", rating: 4, comment: "Good facilities." },
    ];
  },
};

const bookingsApi = {
  async create(payload) {
    if (API_BASE) return apiFetch(`/bookings`, { method: "POST", body: JSON.stringify(payload) });

    const existing = JSON.parse(localStorage.getItem("ps_bookings") || "[]");
    const booking = {
      id: `b-${Date.now()}`,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      ...payload,
    };
    localStorage.setItem("ps_bookings", JSON.stringify([booking, ...existing]));
    return booking;
  },

  async getAll(userId) {
    if (API_BASE) {
      const raw = await apiFetch(`/bookings?userId=${encodeURIComponent(userId)}`);

      const venues = await getVenuesCached();
      const map = flattenVenuesToFacilityMap(venues);

      return (raw || []).map((b) => ({
        ...b,
        id: b.id || b.bookingId,            // normalize
        timeSlot: b.timeSlot || b.slot,
        facility: map.get(b.facilityId) || null,
      }));
    }

    const all = JSON.parse(localStorage.getItem("ps_bookings") || "[]");
    return all.filter((b) => b.userId === userId).map((b) => ({
      ...b,
      facility: findFacilityForBooking(b),
    }));
  },

  async getById(bookingId) {
    if (API_BASE) {
      const b = await apiFetch(`/bookings/${bookingId}`);

      const venues = await getVenuesCached();
      const map = flattenVenuesToFacilityMap(venues);

      return {
        ...b,
        id: b.id || b.bookingId,
        timeSlot: b.timeSlot || b.slot,
        facility: map.get(b.facilityId) || null,
      };
    }

    const all = JSON.parse(localStorage.getItem("ps_bookings") || "[]");
    const b = all.find((x) => x.id === bookingId);
    return b ? { ...b, facility: findFacilityForBooking(b) } : null;
  },
};


const feedbackApi = {
  async create(payload) {
    if (API_BASE) return apiFetch(`/feedback`, { method: "POST", body: JSON.stringify(payload) });

    const existing = JSON.parse(localStorage.getItem("ps_feedback") || "[]");
    const item = { id: `fb-${Date.now()}`, createdAt: new Date().toISOString(), ...payload };
    localStorage.setItem("ps_feedback", JSON.stringify([item, ...existing]));

    if (payload.hasIssue && payload.issueDetails) {
      const tickets = JSON.parse(localStorage.getItem("ps_tickets") || "[]");
      const booking = await bookingsApi.getById(payload.bookingId);
      const t = {
        id: `t-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userName: booking?.userName || "User",
        facility: booking?.facility,
        issueDetails: payload.issueDetails,
      };
      localStorage.setItem("ps_tickets", JSON.stringify([t, ...tickets]));
    }

    return item;
  },

  async getByBookingId(bookingId) {
    if (API_BASE) return apiFetch(`/feedback/by-booking/${encodeURIComponent(bookingId)}`);

    const all = JSON.parse(localStorage.getItem("ps_feedback") || "[]");
    return all.find((x) => x.bookingId === bookingId) || null;
  },

  async update(feedbackId, payload) {
    if (API_BASE) return apiFetch(`/feedback/${encodeURIComponent(feedbackId)}`, { method: "PUT", body: JSON.stringify(payload) });

    const all = JSON.parse(localStorage.getItem("ps_feedback") || "[]");
    const idx = all.findIndex((x) => x.id === feedbackId);
    if (idx === -1) throw new Error("Feedback not found");

    const next = { ...all[idx], ...payload, updatedAt: new Date().toISOString() };
    all[idx] = next;
    localStorage.setItem("ps_feedback", JSON.stringify(all));
    return next;
  },
};

async function findFacilityForBooking(b) {
  // ✅ If backend exists, fetch real venues
  if (API_BASE) {
    try {
      const venues = await apiFetch(`/venues`);
      for (const v of venues || []) {
        const f = (v.facilities || []).find(x => x.id === b.facilityId);
        if (f) {
          return {
            ...f,
            venueName: v.name,
            venueId: v.id,
            location: v.location,
          };
        }
      }
    } catch (e) {
      console.warn("findFacilityForBooking API failed:", e);
    }
  }

  // ✅ Fallback to DEMO_VENUES (offline mode)
  for (const v of DEMO_VENUES) {
    const f = v.facilities.find(x => x.id === b.facilityId);
    if (f) {
      return {
        ...f,
        venueName: v.name,
        venueId: v.id,
        location: v.location,
      };
    }
  }

  return null;
}

/**
 * =========================
 * Pages
 * =========================
 */
function Home({ authUser, onLogout }) {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
  (async () => {
    try {
      const venues = await facilitiesApi.getVenues();
      const list = [];
      for (const v of venues || []) {
        for (const f of v.facilities || []) {
          list.push({ ...f, venueName: v.name, location: v.location });
        }
      }
      setFeatured(list.slice(0, 4));
    } catch {
      // fallback
      const list = [];
      for (const v of DEMO_VENUES) for (const f of v.facilities) list.push({ ...f, venueName: v.name, location: v.location });
      setFeatured(list.slice(0, 4));
    }
  })();
}, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/facilities?search=${encodeURIComponent(q)}`);
    else navigate("/facilities");
  };

  return (
    <Layout authUser={authUser} onLogout={onLogout}>
      {/* hero (same vibe as your Index.jsx) */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              UPM Facility Booking + Maintenance
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Book & Maintain <br />
              <span className="text-primary">UPM Facilities</span> Easily
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Browse facilities by venue (Pusat Sukan, Library, etc.), book slots, and report issues — all in one place.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search facilities or venues..."
                    className="pl-12 h-14 text-base rounded-xl border-2 border-border focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg">Search</Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/facilities">
                <Button size="lg" className="gap-2 px-8">
                  Explore Facilities <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/bookings">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  <CalIcon className="h-4 w-4" /> My Bookings
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {DEMO_VENUES.reduce((a, v) => a + v.facilities.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Facilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {DEMO_VENUES.length}
                </div>
                <div className="text-sm text-muted-foreground">Venues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">4.7</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* featured */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Facilities</h2>
              <p className="text-muted-foreground mt-1">Popular venues at UPM</p>
            </div>
            <Link to="/facilities">
              <Button variant="ghost" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((f) => (
              <FacilityCard key={f.id} facility={f} />
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How PutraServe Works</h2>
            <p className="text-background/70 max-w-xl mx-auto">
              Book facilities and report issues in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Browse by Venue", desc: "Choose a venue like Pusat Sukan or Library, then pick a room/court." },
              { step: "02", title: "Book Your Slot", desc: "Select date/time and confirm your booking details." },
              { step: "03", title: "Rate & Report", desc: "After use, submit feedback or report maintenance issues." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-background/70 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FacilityCard({ facility }) {
  const imgSrc = facility.imageUrl; // from backend
  const [imgError, setImgError] = React.useState(false);

  const showFallback = !imgSrc || imgError;

  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition"
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {/* IMAGE */}
        {imgSrc && !imgError && (
          <img
            src={imgSrc}
            alt={facility.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* FALLBACK (ONLY when image missing or fails) */}
        {showFallback && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center">
            <span className="text-7xl font-bold text-primary/20">
              {facility?.name?.charAt(0) || "F"}
            </span>
          </div>
        )}

        {/* CATEGORY BADGE */}
        <Badge className="absolute top-4 left-4" variant="primary">
          {CATEGORY_LABELS[facility.category] || facility.category}
        </Badge>
      </div>

      <div className="p-5">
        <div className="font-semibold text-base group-hover:text-primary transition">
          {facility.name}
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
          <MapPin className="h-4 w-4" />
          <span className="truncate">
            {facility.venueName || "UPM"} • {facility.location || "Serdang"}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span className="font-medium">{facility.ratingAvg ?? 0}</span>
            <span className="text-muted-foreground">
              ({facility.totalReviews ?? 0})
            </span>
          </div>

          <div className="text-sm font-semibold text-primary">
            {facility.price === 0 ? "Free" : `RM ${facility.price}/hr`}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Facilities({ authUser, onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await facilitiesApi.getVenues({ search: searchQuery, category });
        setVenues(Array.isArray(data) ? data : []);
      } catch {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchQuery, category]);

  const categories = [
    { label: "All", value: "all" },
    { label: "Sports", value: "sports" },
    { label: "Study Rooms", value: "study-room" },
    { label: "Halls", value: "hall" },
    { label: "Labs", value: "lab" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const q = searchQuery.trim();
      if (q) next.set("search", q);
      else next.delete("search");
      return next;
    });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value !== "all") next.set("category", value);
      else next.delete("category");
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(searchQuery) || category !== "all";

  return (
    <Layout authUser={authUser} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Facilities</h1>
          <p className="text-muted-foreground">
            Browse by venue — then pick a room/court inside it (your new category grouping idea).
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by facility or venue..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button type="submit">Search</Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowFilters((v) => !v)}
              className={cn(showFilters && "bg-primary text-primary-foreground")}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>

          {showFilters && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      category === cat.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>

              {searchQuery && (
                <Badge className="gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}

              {category !== "all" && (
                <Badge className="gap-1">
                  {categories.find((c) => c.value === category)?.label || category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange("all")} />
                </Badge>
              )}

              <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border h-40 animate-pulse" />
            ))}
          </div>
        ) : venues.length === 0 ? (
          <EmptyState
            title="No facilities found"
            description="Try adjusting your filters or search terms."
            icon={<Search className="h-6 w-6 text-muted-foreground" />}
            action={<Button onClick={clearFilters}>Clear Filters</Button>}
          />
        ) : (
          <div className="space-y-6">
            {venues.map((venue) => (
              <VenueBlock key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function VenueBlock({ venue }) {
  const [open, setOpen] = useState(true);
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl">{venue.name}</CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4" />
            <span>{venue.location}</span>
          </div>
          <div className="mt-3">
            <Badge variant="outline">{venue.facilities.length} items</Badge>
          </div>
        </div>

        <Button variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"} <ChevronRight className={cn("h-4 w-4", open && "rotate-90")} />
        </Button>
      </CardHeader>

      {open ? (
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venue.facilities.map((f) => (
              <FacilityCard key={f.id} facility={{ ...f, venueName: venue.name, location: venue.location }} />
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function FacilityDetails({ authUser, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [facility, setFacility] = useState(null);
  const [slots, setSlots] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔑 controls fallback letter
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [f, fb] = await Promise.all([
          facilitiesApi.getById(id),
          facilitiesApi.getFeedbacks(id),
        ]);
        setFacility(f);
        setFeedbacks(Array.isArray(fb) ? fb : []);
      } catch (e) {
        console.warn("FacilityDetails load failed:", e);
        setFacility(null);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const s = await facilitiesApi.getTimeSlots(id, selectedDate);
        setSlots(Array.isArray(s) ? s : []);
      } catch {
        setSlots([]);
      }
      setSelectedSlotKey(null);
    })();
  }, [id, selectedDate]);

  const selectedSlot = slots.find((s) => (s.id ?? s.time) === selectedSlotKey);

  const bookNow = () => {
    if (!facility || !selectedSlot) return;
    const params = new URLSearchParams({
      facilityId: facility.id,
      date: selectedDate,
      slot: selectedSlot.time,
    });
    navigate(`/checkout?${params.toString()}`);
  };

  if (loading) {
    return (
      <Layout authUser={authUser} onLogout={onLogout}>
        <div className="container mx-auto px-4 py-10">
          <div className="h-8 w-52 bg-muted rounded mb-6 animate-pulse" />
          <div className="h-72 bg-muted rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!facility) {
    return (
      <Layout authUser={authUser} onLogout={onLogout}>
        <EmptyState
          title="Facility Not Found"
          description="The facility you’re looking for doesn’t exist."
          icon={<Info className="h-6 w-6 text-muted-foreground" />}
          action={
            <Link to="/facilities">
              <Button>Browse Facilities</Button>
            </Link>
          }
        />
      </Layout>
    );
  }

  const imgSrc = facility.imageUrl;

  return (
    <Layout authUser={authUser} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= MAIN ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* ===== IMAGE HERO ===== */}
            <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden">
              {imgSrc && !imgError ? (
                <img
                  src={imgSrc}
                  alt={facility.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <span className="text-8xl font-bold text-primary/20">
                    {facility.name?.charAt(0) || "F"}
                  </span>
                </div>
              )}

              <Badge className="absolute top-4 left-4" variant="primary">
                {CATEGORY_LABELS[facility.category] || facility.category}
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {facility.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {facility.venueName || "UPM"} •{" "}
                    {facility.location || "UPM Serdang"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium text-foreground">
                    {facility.ratingAvg ?? 0}
                  </span>
                  <span>({facility.totalReviews ?? 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <Users className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm text-muted-foreground">Capacity</div>
                <div className="font-semibold">
                  {facility.capacity} people
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <Clock className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm text-muted-foreground">
                  Operating Hours
                </div>
                <div className="font-semibold">
                  {facility.openingHours || "—"}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <Info className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-semibold">
                  {facility.price === 0
                    ? "Free"
                    : `RM ${facility.price}/hr`}
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOOKING SIDEBAR ================= */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-1">Book This Facility</h3>
                <p className="text-sm text-muted-foreground">
                  Select a date and time slot
                </p>
              </div>

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => {
                  const key = s.id ?? s.time;
                  const isSelected = selectedSlotKey === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSlotKey(key)}
                      className={cn(
                        "p-3 rounded-xl border text-sm text-left",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">{s.time}</div>
                    </button>
                  );
                })}
              </div>

              <Button
                className="w-full h-12 rounded-2xl"
                disabled={!selectedSlot}
                onClick={bookNow}
              >
                <Check className="h-4 w-4" /> Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Checkout({ authUser, onLogout }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const facilityId = params.get("facilityId");
  const date = params.get("date");
  const slot = params.get("slot");

  const [facility, setFacility] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [matric, setMatric] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    if (!facilityId) return;
    facilitiesApi.getById(facilityId).then(setFacility);
  }, [facilityId]);

  const total = useMemo(() => (facility?.price || 0), [facility]);
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = EMAIL_REGEX.test(email.trim());
  const showEmailError = emailTouched && !emailValid;

  const canSubmit = fullName.trim() && email.trim() && emailValid && facility && date && slot;

  const confirm = async (e) => {
  e.preventDefault();
  setEmailTouched(true);
  if (!canSubmit) return;

  // ✅ get logged-in user from Cognito
  const authUser = await getAuthUser();
  const userId = authUser?.sub || "user-1";
  const userEmail = authUser?.email || email.trim() || "unknown@email.com";

  await bookingsApi.create({
    userId,
    facilityId,
    date,
    timeSlot: slot,
    userName: fullName.trim() || userEmail,
    userEmail: userEmail,
    userMatricId: matric.trim(),
    totalPrice: total,
  });

  navigate("/bookings");
};

  if (!facilityId || !date || !slot) {
    return (
      <Layout authUser={authUser} onLogout={onLogout}>
        <EmptyState
          title="Missing booking info"
          description="Please choose a facility, date and time slot first."
          icon={<Info className="h-6 w-6 text-muted-foreground" />}
          action={<Link to="/facilities"><Button>Browse Facilities</Button></Link>}
        />
      </Layout>
    );
  }

  return (
    <Layout authUser={authUser} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-10">
        <Button variant="ghost" className="mb-6 -ml-2" onClick={() => navigate(-1)}>
          ← Back
        </Button>

        <h1 className="text-3xl md:text-5xl font-bold text-center mb-10">Confirm Your Booking</h1>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary/40">
                  {facility?.name?.charAt(0) || "F"}
                </span>
              </div>

              <div className="flex-1">
                <div className="text-lg font-semibold">{facility?.name || "Loading..."}</div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{facility?.location || "UPM"}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <CalIcon className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-semibold">{date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-semibold">{slot}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-border mt-6 pt-6 flex items-center justify-between">
              <div className="text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold text-primary">
                {total === 0 ? "Free" : `RM ${total}`}
              </div>
            </div>
          </div>

          <form onSubmit={confirm} className="bg-card border border-border rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Your Details</h2>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  className="mt-2 h-12 rounded-xl"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  className={cn(
                    "mt-2 h-12 rounded-xl",
                    showEmailError && "border-red-500 focus:ring-red-200"
                  )}
                  type="email"
                  placeholder="your.email@student.upm.edu.my"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  required
                />
                {showEmailError ? (
                  <p className="mt-2 text-sm text-red-600">
                    Please enter a valid email format.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium">Matric/Staff ID (Optional)</label>
                <Input
                  className="mt-2 h-12 rounded-xl"
                  placeholder="e.g. 210456"
                  value={matric}
                  onChange={(e) => setMatric(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl text-lg" disabled={!canSubmit}>
                Confirm Booking <Check className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function Bookings({ authUser, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
  (async () => {
    setLoading(true);

    const authUser = await getAuthUser();
    const userId = authUser?.sub || "user-1";

    const data = await bookingsApi.getAll(userId);

    const now = new Date();
    const updated = (Array.isArray(data) ? data : []).map((b) => {
      const end = (b.timeSlot || "").split(" - ")[1];
      if (!b.date || !end) return b;
      const endDateTime = new Date(`${b.date}T${end}:00`);
      if (endDateTime < now && b.status === "upcoming") return { ...b, status: "completed" };
      return b;
    });

setBookings(updated);
      setLoading(false);
    })();
  }, []);

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <Layout showFooter={false} authUser={authUser} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        <div className="grid grid-cols-2 mb-6 bg-muted rounded-xl p-1">
          <button
            className={cn("py-2 rounded-lg text-sm font-medium", tab === "upcoming" ? "bg-background" : "text-muted-foreground")}
            onClick={() => setTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={cn("py-2 rounded-lg text-sm font-medium", tab === "past" ? "bg-background" : "text-muted-foreground")}
            onClick={() => setTab("past")}
          >
            Past
          </button>
        </div>

        {tab === "upcoming" ? (
          loading ? (
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
          ) : upcoming.length === 0 ? (
            <EmptyState title="No upcoming bookings" icon={<CalIcon className="h-6 w-6 text-muted-foreground" />} />
          ) : (
            <div className="space-y-4">
              {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {past.length === 0 ? (
              <EmptyState title="No past bookings" icon={<CalIcon className="h-6 w-6 text-muted-foreground" />} />
            ) : (
              past.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function BookingCard({ booking }) {
  const bookingId = booking.bookingId || booking.id;

  const facilityName =
    booking?.facility?.name ||
    booking?.facilityName ||
    booking?.facilityId ||
    "Facility";

  const venueName =
    booking?.facility?.venueName ||
    booking?.venueName ||
    booking?.venue ||
    "UPM";

  const isCompleted = booking.status === "completed";

  // frontend flag OR backend field (only works if backend sets one of these)
  const feedbackSubmitted =
    Boolean(booking.feedbackSubmitted) ||
    Boolean(booking.hasFeedback) ||
    Boolean(booking.feedbackId);

  const canGiveFeedback = isCompleted && !feedbackSubmitted;
  const canEditFeedback = isCompleted && feedbackSubmitted;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold truncate">{facilityName}</div>

          <div className="text-sm text-muted-foreground mt-1">
            {venueName} • {booking.date} • {booking.timeSlot}
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            <Badge variant="outline">{booking.status}</Badge>
            <Badge variant="secondary">Free</Badge>

            {feedbackSubmitted ? (
              <Badge variant="primary">Feedback Submitted</Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {canGiveFeedback ? (
            <Link to={`/feedback/${bookingId}`}>
              <Button size="sm">Give Feedback</Button>
            </Link>
          ) : canEditFeedback ? (
            <Link to={`/feedback/${bookingId}?mode=edit`}>
              <Button size="sm" variant="outline">
                Edit Feedback
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Feedback Locked
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function FeedbackForm({ authUser, onLogout }) {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [hasIssue, setHasIssue] = useState(false);
  const [issueCategory, setIssueCategory] = useState("other");
  const [issueSeverity, setIssueSeverity] = useState("low");
  const [issueDescription, setIssueDescription] = useState("");
  const [preferredAction, setPreferredAction] = useState("repair");
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const b = await bookingsApi.getById(bookingId);
      setBooking(b);
    } catch (err) {
      console.warn("getById failed, fallback booking:", err);

      // fallback so feedback page still works
      setBooking({
        id: bookingId,
        bookingId,
        status: "upcoming", // or "completed" for demo
        facility: { name: "Facility" },
      });
    } finally {
      setLoading(false);
    }
  })();
}, [bookingId]);



  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Rating required.");
    if (hasIssue && !issueDescription.trim()) return alert("Please describe the issue.");

    setSubmitting(true);
    try {
      await feedbackApi.create({
        bookingId,
        rating,
        comment,
        hasIssue,
        issueDetails: hasIssue
          ? {
              category: issueCategory,
              severity: issueSeverity,
              description: issueDescription,
              photo: photoPreview || undefined,
              preferredAction,
              status: "open",
            }
          : undefined,
      });
      navigate("/bookings");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout authUser={authUser} onLogout={onLogout}>
        <div className="container mx-auto px-4 py-10">
          <div className="h-8 w-52 bg-muted rounded mb-6 animate-pulse" />
          <div className="h-72 bg-muted rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout authUser={authUser} onLogout={onLogout}>
        <EmptyState
          title="Booking Not Found"
          description="We couldn’t find this booking."
          icon={<AlertTriangle className="h-6 w-6 text-warning" />}
          action={<Link to="/bookings"><Button>View My Bookings</Button></Link>}
        />
      </Layout>
    );
  }

  // (same logic as your original: feedback after completed) :contentReference[oaicite:10]{index=10}
  const canSubmitFeedback =
  booking.status === "completed" || booking.status === "upcoming";

if (!canSubmitFeedback) {
  return (
    <Layout authUser={authUser} onLogout={onLogout}>
      <EmptyState
        title="Feedback Not Available"
        description={`Current status: ${booking.status}`}
        icon={<Info className="h-6 w-6 text-muted-foreground" />}
        action={<Link to="/bookings"><Button>View My Bookings</Button></Link>}
      />
    </Layout>
  );
}


  return (
    <Layout showFooter={false} authUser={authUser} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Give Feedback</h1>
          <p className="text-muted-foreground mb-6">
            Share your experience at{" "}
            <span className="font-medium text-foreground">
              {booking.facility?.name || "this facility"}
            </span>
          </p>

          <form onSubmit={submit} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="text-base font-semibold mb-4">Overall Experience *</div>
              <div className="flex items-center gap-4">
                <RatingStars rating={rating} interactive onChange={(v) => setRating(v)} size="lg" />
                <span className="text-lg font-medium text-muted-foreground">
                  {rating > 0 ? `${rating}/5` : "Tap to rate"}
                </span>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="text-base font-semibold mb-3">What went well?</div>
              <Textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">Report Maintenance Issue</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Did you notice anything that needs fixing?
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hasIssue}
                  onChange={(e) => setHasIssue(e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
            </div>

            {hasIssue ? (
              <div className="bg-warning/5 border-2 border-warning/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-warning-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <div className="font-semibold">Maintenance Report</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Issue Category</label>
                    <select
                      value={issueCategory}
                      onChange={(e) => setIssueCategory(e.target.value)}
                      className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-3 text-sm"
                    >
                      {[
                        ["lighting", "Lighting"],
                        ["aircond", "Air Conditioning"],
                        ["projector-av", "Projector/AV"],
                        ["court-floor", "Court Floor"],
                        ["toilet", "Toilet"],
                        ["seating", "Seating"],
                        ["internet", "Internet"],
                        ["other", "Other"],
                      ].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Preferred Action</label>
                    <select
                      value={preferredAction}
                      onChange={(e) => setPreferredAction(e.target.value)}
                      className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-3 text-sm"
                    >
                      {["repair", "replace", "inspect", "cleaning"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["low", "medium", "high"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setIssueSeverity(s)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all",
                          issueSeverity === s ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="font-medium text-sm">{s.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">
                          {s === "high" ? "Urgent" : s === "medium" ? "Affects usability" : "Minor"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">What needs to be fixed? *</label>
                  <Textarea
                    className="mt-2"
                    placeholder="Describe the issue..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Upload Photo (Optional)</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Choose image</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-border" />
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <Button type="submit" className="w-full h-14 rounded-2xl text-lg" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function Admin({ authUser, onLogout }) {
  // demo: pull tickets from localStorage (backend version will call /admin/reports)
  const [tickets, setTickets] = useState(() => JSON.parse(localStorage.getItem("ps_tickets") || "[]"));
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return tickets;
    return tickets.filter((t) => (t.issueDetails?.status || "open") === filter);
  }, [tickets, filter]);

  const selected = useMemo(() => filtered.find((t) => t.id === selectedId) || null, [filtered, selectedId]);

  const setStatus = (status) => {
    if (!selectedId) return;
    const next = tickets.map((t) =>
      t.id === selectedId
        ? { ...t, issueDetails: { ...(t.issueDetails || {}), status } }
        : t
    );
    setTickets(next);
    localStorage.setItem("ps_tickets", JSON.stringify(next));
  };

  const stats = useMemo(() => {
    const totalFacilities = DEMO_VENUES.reduce((a, v) => a + v.facilities.length, 0);
    const open = tickets.filter((t) => (t.issueDetails?.status || "open") === "open").length;
    return { totalFacilities, open, users: 1000, rating: 4.7 };
  }, [tickets]);

  const statusColors = {
    open: "bg-warning/15 text-warning-foreground",
    "in-progress": "bg-info/15 text-info",
    resolved: "bg-success/15 text-success",
  };

  return (
    <Layout showFooter={false} authUser={authUser} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage facilities and maintenance reports</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={CalIcon} label="Bookings Today" value="—" />
          <StatCard icon={Wrench} label="Open Tickets" value={stats.open} />
          <StatCard icon={Star} label="Avg Rating" value={stats.rating} />
          <StatCard icon={Users} label="Total Users" value={stats.users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Maintenance Reports
                  </CardTitle>

                  <div className="flex gap-2">
                    {["all", "open", "in-progress", "resolved"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                          filter === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        type="button"
                      >
                        {s === "all" ? "All" : s.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No reports found</div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((t) => {
                      const status = t.issueDetails?.status || "open";
                      const facilityName = t.facility?.name || "Unknown Facility";
                      const location = t.facility?.location || "";

                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedId(t.id)}
                          type="button"
                          className={cn(
                            "w-full text-left p-4 rounded-xl border transition-all",
                            selectedId === t.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold truncate">{facilityName}</span>
                                <Badge className={cn("text-xs", statusColors[status])}>
                                  {status}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground truncate">
                                {t.issueDetails?.category}: {t.issueDetails?.description}
                              </p>

                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{t.userName || "User"}</span>
                                <span>•</span>
                                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                {location ? (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{location}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selected ? (
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Report Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Facility</div>
                    <div className="font-semibold">{selected.facility?.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {selected.facility?.location}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Category</div>
                      <Badge variant="secondary">{selected.issueDetails?.category || "other"}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Severity</div>
                      <Badge variant="outline">{selected.issueDetails?.severity || "low"}</Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Description</div>
                    <p className="text-sm">{selected.issueDetails?.description}</p>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="text-sm font-medium mb-2">Update Status</div>
                    <div className="grid grid-cols-3 gap-2">
                      {["open", "in-progress", "resolved"].map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={(selected.issueDetails?.status || "open") === s ? "default" : "outline"}
                          className="text-xs"
                          onClick={() => setStatus(s)}
                        >
                          {s.replace("-", " ")}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Select a report to view details and update status.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Login({ onAuthed, authUser, onLogout }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const loginErrors = useMemo(() => {
    const e = {};
    if (!loginForm.email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(loginForm.email)) e.email = "Please enter a valid email.";
    if (!loginForm.password.trim()) e.password = "Password is required.";
    return e;
  }, [loginForm]);

  const signupErrors = useMemo(() => {
    const e = {};
    if (!signupForm.email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(signupForm.email)) e.email = "Please enter a valid email.";
    if (!signupForm.password.trim()) e.password = "Password is required.";
    else if (signupForm.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (!signupForm.confirmPassword.trim()) e.confirmPassword = "Please confirm your password.";
    else if (signupForm.confirmPassword !== signupForm.password) e.confirmPassword = "Passwords do not match.";
    return e;
  }, [signupForm]);

  const canLogin = Object.keys(loginErrors).length === 0;
  const canSignup = Object.keys(signupErrors).length === 0;

  const FieldError = ({ msg }) => (msg ? <p className="mt-2 text-sm text-destructive">{msg}</p> : null);

  const onLogin = async (e) => {
  e.preventDefault();
  if (!canLogin) return;

  try {
    await signIn({
      username: loginForm.email,
      password: loginForm.password,
    });

    await onAuthed?.(); // refresh authUser in App
    navigate("/facilities");
  } catch (err) {
    alert(err?.message || "Login failed");
  }
};


  const onSignup = async (e) => {
  e.preventDefault();
  if (!canSignup) return;

  try {
    await signUp({
      username: signupForm.email,
      password: signupForm.password,
      options: {
        userAttributes: { email: signupForm.email },
      },
    });

    setPendingEmail(signupForm.email);
    setNeedsConfirm(true); // show code input
  } catch (err) {
    alert(err?.message || "Sign up failed");
  }
};

const onConfirmSignup = async (e) => {
  e.preventDefault();
  try {
    await confirmSignUp({
      username: pendingEmail,
      confirmationCode: confirmCode.trim(),
    });

    // after confirm, go login
    setNeedsConfirm(false);
    setTab("login");
  } catch (err) {
    alert(err?.message || "Confirmation failed");
  }
};



  return (
  <Layout showFooter={false} authUser={authUser} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
            PS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mt-4">Welcome to PutraServe</h1>
          <p className="text-muted-foreground mt-2">UPM Facility Booking System</p>
        </div>

        <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-2 mb-8 bg-muted rounded-xl p-1">
            <button
              className={cn("py-2 rounded-lg text-sm font-medium", tab === "login" ? "bg-background" : "text-muted-foreground")}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={cn("py-2 rounded-lg text-sm font-medium", tab === "signup" ? "bg-background" : "text-muted-foreground")}
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>
          </div>

          {needsConfirm ? (
            <form onSubmit={onConfirmSignup} className="space-y-5">
              <div className="text-sm text-muted-foreground">
                Enter the code sent to <b>{pendingEmail}</b>
              </div>

             <div>
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                className="mt-2 h-12 rounded-xl"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                placeholder="123456"
                required
              />
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl text-lg">
              Confirm Sign Up
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-2xl"
              onClick={() => {
                setNeedsConfirm(false);
                setConfirmCode("");
                setTab("signup"); // go back if they want
              }}
            >
              Back
            </Button>
          </form>
        ) : tab === "login" ? (
  <form onSubmit={onLogin} className="space-y-5">
    <div>
      <label className="text-sm font-medium">Email</label>
      <div className={cn(
        "mt-2 flex items-center gap-2 rounded-xl border border-border px-3 h-12",
        loginErrors.email && "border-destructive"
      )}>
        <Mail className="h-5 w-5 text-muted-foreground" />
        <input
          type="email"
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="your.email@student.upm.edu.my"
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
        />
      </div>
      <FieldError msg={loginErrors.email} />
    </div>

    <div>
  <label className="text-sm font-medium">Password</label>
  <div
    className={cn(
      "mt-2 flex items-center gap-2 rounded-xl border border-border px-3 h-12",
      loginErrors.password && "border-destructive"
    )}
  >
    <Lock className="h-5 w-5 text-muted-foreground" />

    <input
      type={showLoginPassword ? "text" : "password"}
      className="flex-1 bg-transparent outline-none text-sm"
      placeholder="••••••••"
      value={loginForm.password}
      onChange={(e) =>
        setLoginForm({ ...loginForm, password: e.target.value })
      }
    />

    <button
      type="button"
      onClick={() => setShowLoginPassword((v) => !v)}
      className="p-1 rounded-md hover:bg-muted"
      aria-label={showLoginPassword ? "Hide password" : "Show password"}
    >
      {showLoginPassword ? (
        <EyeOff className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Eye className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  </div>
  <FieldError msg={loginErrors.password} />
</div>

    <Button
      type="submit"
      className="w-full h-14 rounded-2xl text-lg"
      disabled={!canLogin}
    >
      Login
    </Button>
  </form>
) : (
  <form onSubmit={onSignup} className="space-y-5">
    <div>
      <label className="text-sm font-medium">Email</label>
      <div
        className={cn(
          "mt-2 flex items-center gap-2 rounded-xl border border-border px-3 h-12",
          signupErrors.email && "border-destructive"
        )}
      >
        <Mail className="h-5 w-5 text-muted-foreground" />
        <input
          type="email"
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="your.email@student.upm.edu.my"
          value={signupForm.email}
          onChange={(e) =>
            setSignupForm({ ...signupForm, email: e.target.value })
          }
        />
      </div>
      <FieldError msg={signupErrors.email} />
    </div>

    <div>
      <label className="text-sm font-medium">Password</label>
      <div
        className={cn(
          "mt-2 flex items-center gap-2 rounded-xl border border-border px-3 h-12",
          signupErrors.password && "border-destructive"
        )}
      >
        <Lock className="h-5 w-5 text-muted-foreground" />

      <input
        type={showSignupPassword ? "text" : "password"}
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Minimum 6 characters"
        value={signupForm.password}
        onChange={(e) =>
          setSignupForm({ ...signupForm, password: e.target.value })
      }
    />

    <button
      type="button"
      onClick={() => setShowSignupPassword((v) => !v)}
      className="p-1 rounded-md hover:bg-muted"
      aria-label={showSignupPassword ? "Hide password" : "Show password"}
    >
      {showSignupPassword ? (
        <EyeOff className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Eye className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  </div>
  <FieldError msg={signupErrors.password} />
</div>

    <div>
      <label className="text-sm font-medium">Confirm Password</label>
      <div
        className={cn(
          "mt-2 flex items-center gap-2 rounded-xl border border-border px-3 h-12",
          signupErrors.confirmPassword && "border-destructive"
    )}
  >
    <Lock className="h-5 w-5 text-muted-foreground" />

    <input
      type={showSignupConfirmPassword ? "text" : "password"}
      className="flex-1 bg-transparent outline-none text-sm"
      placeholder="Re-enter password"
      value={signupForm.confirmPassword}
      onChange={(e) =>
        setSignupForm({ ...signupForm, confirmPassword: e.target.value })
      }
    />

    <button
      type="button"
      onClick={() => setShowSignupConfirmPassword((v) => !v)}
      className="p-1 rounded-md hover:bg-muted"
      aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
    >
      {showSignupConfirmPassword ? (
        <EyeOff className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Eye className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  </div>
  <FieldError msg={signupErrors.confirmPassword} />
</div>

    <Button
      type="submit"
      className="w-full h-14 rounded-2xl text-lg"
      disabled={!canSignup}
    >
      Create Account
    </Button>

    <p className="text-center text-sm text-muted-foreground">
      After sign up, you’ll need to enter the verification code sent to your email.
    </p>
  </form>
)
}
        </div>
      </div>
    </Layout>
  );
}

function NotFound({ authUser, onLogout }) {
  return (
    <Layout authUser={authUser} onLogout={onLogout}>
      <EmptyState
        title="404 - Page Not Found"
        description="The page you requested doesn't exist."
        icon={<AlertTriangle className="h-6 w-6 text-warning" />}
        action={<Link to="/"><Button>Go Home</Button></Link>}
      />
    </Layout>
  );
}

/**
 * =========================
 * App root
 * =========================
 */
export default function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    getAuthUser().then(setAuthUser);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setAuthUser(null);
  };

  return (
    <BrowserRouter>
      <div className="text-[15px]">
        <Routes>
          <Route path="/" element={<Home authUser={authUser} onLogout={handleLogout} />} />
          <Route path="/facilities" element={<Facilities authUser={authUser} onLogout={handleLogout} />} />
          <Route path="/facilities/:id" element={<FacilityDetails authUser={authUser} onLogout={handleLogout} />} />
          <Route path="/checkout" element={<Checkout authUser={authUser} onLogout={handleLogout} />} />
          <Route path="/bookings" element={<Bookings authUser={authUser} onLogout={handleLogout} />} />
          <Route path="/feedback/:bookingId" element={<FeedbackForm authUser={authUser} onLogout={handleLogout} />} />
          <Route path="/admin" element={<Admin authUser={authUser} onLogout={handleLogout} />} />
          <Route
            path="/login"
            element={
              <Login
                authUser={authUser}
                onLogout={handleLogout}
                onAuthed={() => getAuthUser().then(setAuthUser)}
              />
        }
      />
      
      <Route path="*" element={<NotFound authUser={authUser} onLogout={handleLogout} />} />
    </Routes>

      </div>
    </BrowserRouter>
  );
}
