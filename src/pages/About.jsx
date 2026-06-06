import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* =====================================
   PAGE HEADER COMPONENT
===================================== */
function PageHeader({ label, title }) {
    return (
        <div className="text-center mb-14 space-y-4">

            <p className="text-[11px] uppercase tracking-[0.45em] text-purple-500 font-medium">
                {label}
            </p>

            <h1 className="text-4xl sm:text-6xl font-display font-semibold text-white leading-none tracking-[0.04em]">
                {title}
            </h1>

            <div className="flex justify-center">
                <div className="w-32 h-[2px] rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-90" />
            </div>

        </div>
    );
}

/* =====================================
   ABOUT PAGE
===================================== */
export default function About() {
    const [active, setActive] = useState("mission");

    return (
        <div className="pt-10 pb-24 px-4 max-w-6xl mx-auto relative">

            {/* BACKGROUND GLOW */}
            <div className="absolute inset-0 -z-10 flex justify-center">
                <div className="w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            {/* HEADER */}
            <PageHeader
                label="About Us"
                title="Spirit Filled Ministries"
            />

            {/* TABS CONTAINER */}
            <div className="flex flex-wrap justify-center gap-4 mb-14 bg-black/35 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl shadow-black/30 max-w-fit mx-auto font-sans tracking-wide text-sm sm:text-base">

                <TabButton active={active} value="mission" setActive={setActive}>
                    Mission
                </TabButton>

                <TabButton active={active} value="vision" setActive={setActive}>
                    Vision
                </TabButton>

                <TabButton active={active} value="churchHistory" setActive={setActive}>
                    Church History
                </TabButton>

                <TabButton active={active} value="structure" setActive={setActive}>
                    Structure
                </TabButton>

            </div>

            {active === "mission" && <Mission />}
            {active === "vision" && <Vision />}
            {active === "churchHistory" && <ChurchHistory />}
            {active === "structure" && <OrganisationStructure />}
        </div>
    );
}

/* =====================================
   TAB BUTTON (UNIFIED STYLE)
===================================== */
function TabButton({ active, value, setActive, children }) {
    const isActive = active === value;

    return (
        <button
            onClick={() => setActive(value)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-[0.18em] backdrop-blur-xl transition-all duration-300
                ${
                isActive
                    ? "bg-purple-600 text-white border border-purple-400 shadow-lg shadow-purple-500/30"
                    : "bg-black/50 text-white/70 border border-white/10 hover:bg-black/70 hover:text-white"
            }
            `}
        >
            {children}
        </button>
    );
}

/* =====================================
   MISSION / VISION
===================================== */
function Mission() {
    return (
        <GlassCard
            title="Our Mission"
            text="The mission of Spirit Filled Ministries is God’s mission — to empower believers through the Word of God and the Holy Spirit for the work of ministry and the fulfillment of their divine purpose according to Matthew 28:20."
        />
    );
}

function Vision() {
    return (
        <GlassCard
            title="Our Vision"
            text="Spirit Filled Ministries is a purpose-driven church called to exalt Jesus Christ through worship, edify believers through fellowship, equip the saints through teaching, evangelize communities through outreach, and empower mature believers for ministry and service in the Kingdom of God. The ministry is empowered by the Word of God and the Holy Spirit to help believers fulfilltheir God-given purpose.
‎
‎Scripture References: Luke 9:1–2, Ephesians 4:11–13"
        />
    );
}

function ChurchHistory() {
    return (
        <GlassCard title="Church History">
            <div className="space-y-5 leading-relaxed">
                <p>
                    Spirit Filled Ministries – Practical Deliverance and Healing is a growing church located in Strand, Western Cape, South Africa. The ministry is committed to spreading the Gospel of Jesus Christ and transforming lives through prayer, worship, deliverance, healing, and the teaching of the Word of God.
                </p>

                <p>
                    The church was founded by Apostle V.B Madolo, who received the calling from God in 2001 and entered full-time ministry in 2003. Before establishing the ministry, he faithfully served under the leadership of the late Apostle V.W Kula for several years. In 2003, he was released into ministry and officially founded Spirit Filled Ministries, which has continued to grow and thrive for over 22 years.
                </p>

                <p>
                    In 2004, Apostle Madolo married his beloved wife and ministry partner, Nomthandazo C. Madolo. Together, they have dedicated their lives to serving God and building His Kingdom.
                </p>

                <p>
                    Under the leadership of Apostle V. B Madolo, Spirit Filled Ministries has expanded from its base in Strand to include branches in Stockroad, Grabouw, and Kosana (Kalkfontein) in the Western Cape Province, and will be expanding to the Eastern Cape Province starting in Cofimvaba at the end of 2026.
                </p>

                <p>
                    Through God’s grace and faithful leadership, the ministry has successfully built four church buildings and ordained many pastors who continue to serve under the vision of the ministry.
                </p>

                <p>
                    Apostle Madolo strongly believes in the Great Commission of the Lord Jesus Christ and is passionate about reaching souls, equipping believers, and caring for those in need. The church continues to impact communities through evangelism, prayer, teaching, fellowship, outreach programs, and spiritual empowerment.
                </p>
            </div>
        </GlassCard>
    );
}

/* =====================================
   GLASS CARD (UNIFIED)
===================================== */
function GlassCard({ title, text, children }) {
    return (
        <div className="max-w-3xl mx-auto text-center bg-black/55 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-black/40">

            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4 tracking-tight font-sans">
                {title}
            </h2>

            {children ? (
                <div className="text-white text-sm sm:text-base leading-relaxed tracking-wide font-sans text-left space-y-5">
                    {children}
                </div>
            ) : (
                <p className="text-white text-sm sm:text-base leading-relaxed tracking-wide font-sans">
                    {text}
                </p>
            )}

        </div>
    );
}

/* =====================================
   ORGANISATION STRUCTURE
===================================== */
function OrganisationStructure() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from("leadership")
                .select("*")
                .order("level", { ascending: true })
                .order("horizontal_order", { ascending: true });

            setLeaders(data || []);
            setLoading(false);
        }

        load();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center mt-20 text-gray-400 text-sm">
                Loading leadership...
            </div>
        );
    }

    return (
        <section className="mt-10">

            {/* HEADER */}
            <div className="text-center mb-16 space-y-4">

                <p className="text-[11px] uppercase tracking-[0.45em] text-purple-500 font-medium">
                    Leadership
                </p>

                <h2 className="text-4xl sm:text-6xl font-display font-semibold text-white leading-none tracking-[0.04em]">
                    Meet Our Leaders
                </h2>

                <div className="flex justify-center">
                    <div className="w-32 h-[2px] rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-90" />
                </div>

            </div>

            {/* GRID */}
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">

                {leaders.map((person) => (
                    <div
                        key={person.id}
                        className="group rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl p-5 shadow-2xl shadow-black/30 hover:bg-black/60 transition-all duration-300 hover:-translate-y-1"
                    >

                        {/* IMAGE */}
                        <div className="relative mx-auto mb-4 w-48 h-48">

                            <div className="absolute inset-0 rounded-full ring-2 ring-purple-500/40 group-hover:ring-purple-500 transition" />

                            <div className="w-full h-full rounded-full overflow-hidden shadow-xl">

                                {person.photo_url ? (
                                    <img
                                        src={person.photo_url}
                                        alt={person.name}
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                                        Photo
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* NAME */}
                        <h3 className="text-lg font-semibold text-white text-center">
                            {person.name}
                        </h3>

                        {/* ROLE */}
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/60 text-center">
                            {person.role}
                        </p>

                    </div>
                ))}

            </div>
        </section>
    );
}