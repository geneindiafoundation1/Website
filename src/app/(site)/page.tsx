import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { HeroGlobe } from "@/components/HeroGlobe";
import { MissionOrbit } from "@/components/MissionOrbit";
import { PostCard } from "@/components/PostCard";
import { StoryStairs } from "@/components/StoryStairs";
import { getPosts } from "@/lib/content";

const ACRONYM = [
  ["G", "Global - mentors from across the world"],
  ["E", "Education - expert-led, interactive programs"],
  ["N", "Networking - bridges between generations"],
  ["E", "Excellence - nurtured, not inherited"],
];

const STATS = [
  { value: 36, suffix: "", label: "States & UTs welcome" },
  { value: 5, suffix: "", label: "Disciplines covered" },
  { value: 100, suffix: "%", label: "Volunteer-delivered" },
  { value: 0, suffix: "%", label: "Political or religious affiliation" },
];

const PILLARS = [
  {
    title: "Mentorship across disciplines",
    body: "Structured guidance and expert-led programs spanning health sciences, humanities, engineering, information technology, and social sciences.",
  },
  {
    title: "Reach without boundaries",
    body: "Open to participants from every state and Union Territory, without distinction of identity, geography, religion, or socioeconomic background.",
  },
  {
    title: "Future-ready skills",
    body: "Current and emerging tools and technologies that prepare learners not just for jobs, but for innovation and entrepreneurship.",
  },
];

export default async function HomePage() {
  const posts = (await getPosts()).slice(0, 3);

  return (
    <>
      <div className="hero">
        <div className="wrap hero-in">
          <div className="hero-seq">
            <p className="eyebrow">Global Education and Networking for Excellence</p>
            <h1>
              Talent is everywhere.
              <br />
              <em>Opportunity is not.</em>
            </h1>
            <p className="lede">
              GENE-INDIA Foundation connects experienced professionals across the globe with
              students and young professionals in every state and Union Territory of India - through
              structured, volunteer-led mentorship.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary btn-lg" href="/donate">
                Support a mentee
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/about">
                Read our story
              </Link>
            </div>
          </div>

          <div className="hero-side">
            <HeroGlobe />

            <div className="hero-card">
              <p className="eyebrow">What GENE stands for</p>
              <div className="acro">
                {ACRONYM.map(([letter, text], i) => (
                  <div key={i}>
                    <b>{letter}</b>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="stats-wrap">
          <div className="stats">
            {STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <b>
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="wrap">
        <div className="mission-in" data-reveal>
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">Our mission</p>
            <h2>
              A volunteer-driven ecosystem of mentorship, education, and professional development.
            </h2>
            <p className="lede">
              We provide accessible, volunteer-led mentorship and educational programs that foster
              excellence, innovation, leadership, and entrepreneurship across disciplines - while
              promoting inclusivity, collaboration, and equal opportunity for every learner in India.
            </p>
          </div>

          <MissionOrbit />
        </div>

        <div className="grid-3 stagger" data-reveal>
          {PILLARS.map((p) => (
            <div className="card" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="band">
        <section className="wrap">
          <div className="story-in" data-reveal>
            <StoryStairs />

            <div className="story-copy">
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <p className="eyebrow">Our story</p>
                <h2>It wasn&rsquo;t a lack of talent. It was a lack of access.</h2>
              </div>
              <div className="prose">
                <p>
                  For GENE-INDIA Foundation, the beginning came not in a boardroom, but in countless
                  conversations with students across India who all seemed to be asking some version
                  of the same question:{" "}
                  <strong>&ldquo;I have the drive, but where do I even begin?&rdquo;</strong>
                </p>
                <p>
                  Over the years we watched brilliant, hardworking young people - from small towns
                  and big cities alike - hit the same invisible wall. Access to someone who had
                  walked the path before them. Access to a mentor who could say, &ldquo;here&rsquo;s
                  what worked for me, and here&rsquo;s what I wish someone had told me sooner.&rdquo;
                </p>
                <p>
                  We didn&rsquo;t want to build another institution that spoke about change. We wanted
                  to build a community that created it - one student, one mentor, one conversation at a
                  time.
                </p>
              </div>
              <div>
                <Link className="btn btn-primary" href="/about">
                  Continue reading
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="wrap">
        <div className="sec-head" data-reveal>
          <p className="eyebrow">From the blog</p>
          <h2>Stories &amp; updates</h2>
        </div>
        <div className="posts stagger" data-reveal>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <hr className="rule" />

      <section className="wrap center" data-reveal>
        <p className="eyebrow">Support the foundation</p>
        <h2 style={{ fontSize: "var(--step-3)", maxWidth: "20ch" }}>
          Every contribution goes directly to the foundation.
        </h2>
        <p className="lede">
          No payment gateway, no card handling, and no transaction fees - 100% of what you give
          reaches the students we mentor.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary btn-lg" href="/donate">
            Donate now
          </Link>
          <Link className="btn btn-ghost btn-lg" href="/contact">
            Volunteer as a mentor
          </Link>
        </div>
      </section>
    </>
  );
}
