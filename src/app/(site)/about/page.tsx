import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "GENE stands for Global Education and Networking for Excellence. Our story, vision, mission, and the five objectives that shape everything we do.",
};

const ACRONYM = [
  { letter: "G", word: "Global", body: "Mentors and networks that reach beyond any one city, state, or country." },
  { letter: "E", word: "Education", body: "Expert-led, interactive programs built on lived professional experience." },
  { letter: "N", word: "Networking", body: "Bridges between generations of experience and generations of ambition." },
  { letter: "E", word: "Excellence", body: "Nurtured and passed on - never left to chance or circumstance." },
];

const OBJECTIVES = [
  {
    title: "Mentorship and skill-building across disciplines",
    body: "To support students and young professionals through structured mentorship, guidance, and interactive, expert-led programs spanning health sciences, humanities, engineering, information technology, and social sciences - helping learners translate potential into real, marketable expertise.",
  },
  {
    title: "Reach without boundaries",
    body: "To welcome participants from every state and Union Territory of India, without distinction of identity, geography, religion, or socioeconomic background - because opportunity should never depend on where or to whom a person was born.",
  },
  {
    title: "Neutral ground for all",
    body: "To remain strictly apolitical and non-religious in all activities and operations, ensuring the Foundation is a space where learners of every background feel equally welcome and equally invested in.",
  },
  {
    title: "Future-ready skills",
    body: "To equip learners with current and emerging tools, technologies, and skills that prepare them not just for jobs, but for professional growth, innovation, and entrepreneurship in a rapidly changing world.",
  },
  {
    title: "A volunteer-powered model",
    body: "To deliver every program through volunteers with real, hands-on expertise in science, medicine, arts, technology, engineering, communication, and business - ensuring that what learners receive is not theoretical, but grounded in lived professional experience.",
  },
];

const AIMS = [
  {
    title: "Excellence across fields",
    body: "Biological and health sciences, engineering, technology, humanities, social sciences, business, and the arts.",
  },
  {
    title: "Contemporary knowledge",
    body: "Emerging technologies, critical thinking, leadership, communication, and entrepreneurial skills.",
  },
  {
    title: "Collaboration",
    body: "Across disciplines, institutions, industries, and communities, to encourage innovation and lifelong learning.",
  },
  {
    title: "Equitable access",
    body: "Every motivated learner can participate and thrive, irrespective of location, status, religion, gender, or background.",
  },
  {
    title: "A culture of service",
    body: "Integrity, scientific temper, creativity, and social responsibility, through dedicated volunteers and experts.",
  },
  {
    title: "National & global networks",
    body: "Knowledge exchange, career development, research collaborations, and innovation for the benefit of society.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="phead">
        <div className="wrap">
          <p className="eyebrow">About the foundation</p>
          <h1>Excellence isn&rsquo;t inherited by chance.</h1>
          <p className="lede">
            GENE stands for Global Education and Networking for Excellence - because excellence is
            something that can be nurtured, passed on, and multiplied when the right people show up
            for each other.
          </p>
        </div>
      </div>

      <div className="wrap acro-wrap">
        <div className="acro-strip stagger" data-reveal>
          {ACRONYM.map((a, i) => (
            <div key={i}>
              <b aria-hidden="true">{a.letter}</b>
              <strong>{a.word}</strong>
              <span>{a.body}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="wrap vm-sec">
        <div className="vm-grid stagger" data-reveal>
          <div className="panel panel-titled">
            <p className="eyebrow">Vision</p>
            <p className="panel-body">
              To build an inclusive, knowledge-driven society where every aspiring learner -
              regardless of geography, socioeconomic background, or identity - has access to
              mentorship, education, and opportunities that empower them to reach their full
              potential.
            </p>
          </div>
          <div className="panel panel-titled">
            <p className="eyebrow">Mission</p>
            <p className="panel-body">
              To build a dynamic, volunteer-driven ecosystem of mentorship, education, and
              professional development that connects experienced professionals with students and
              young professionals across India.
            </p>
          </div>
        </div>
        <p className="flag vm-flag" data-reveal>
          As an apolitical and non-religious organization, we are committed to a safe, inclusive, and
          intellectually vibrant environment where diversity is celebrated and ideas are freely
          exchanged.
        </p>
      </section>

      <section className="wrap about-story">
        <div className="story-grid" data-reveal>
          <div className="story-aside">
            <p className="eyebrow">Our story</p>
            <h2>A vision born from responsibility</h2>
            <blockquote className="pullquote">
              It wasn&rsquo;t a lack of talent. It wasn&rsquo;t a lack of ambition.{" "}
              <em>It was a lack of access.</em>
            </blockquote>
          </div>

          <div className="prose story-body">
            <p>
              Every idea has a moment of origin - a quiet realization that grows into a calling. For
              GENE-INDIA Foundation, that moment came not in a boardroom, but in countless
              conversations with students across India who all seemed to be asking some version of
              the same question: &ldquo;I have the drive, but where do I even begin?&rdquo;
            </p>
            <p>
              Over the years, we watched brilliant, hardworking young people - from small towns and
              big cities alike - hit the same invisible wall.
            </p>
            <p>
              Access to someone who had walked the path before them; access to guidance that went
              beyond textbooks. Too many students were left to navigate their futures alone,
              second-guessing decisions that could shape the rest of their lives simply because no
              one had opened a door for them. That realization became impossible to ignore - and the
              Foundation began as a commitment to make a difference not from a distance, but at the
              grassroots, where it matters most.
            </p>
            <p>
              What started as an idea shared between a few committed individuals has grown into a
              movement of volunteers - professionals from medicine, science, engineering, technology,
              business, and the arts - who give their time not because they have to, but because they
              remember what it felt like to need guidance and not find it.{" "}
              <strong>That shared memory is what holds this Foundation together.</strong>
            </p>
            <p>
              Today the Foundation stands as a bridge between generations of experience and
              generations of ambition, working to ensure that no student&rsquo;s dream is limited by
              where they were born, what they lack, or who they don&rsquo;t yet know. This is only
              the beginning - but it is a beginning rooted in something real: when we invest in one
              student at the grassroots, we invest in the future of an entire community.
            </p>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="wrap">
        <div className="sec-head" data-reveal>
          <p className="eyebrow">Objectives</p>
          <h2>Five commitments that shape everything we do</h2>
          <p className="lede">
            They are not aspirations we grew into after the fact - they are the terms on which the
            Foundation was built, and the measure we hold every program against.
          </p>
        </div>
        <div className="obj-grid stagger" data-reveal>
          {OBJECTIVES.map((o, i) => (
            <article className="obj-card" key={o.title}>
              <span className="obj-card-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="band">
        <section className="wrap">
          <div className="sec-head" data-reveal>
            <p className="eyebrow">Through our programs, we aim to</p>
            <h2>Foster excellence, and build the networks that carry it forward</h2>
          </div>
          <div className="grid-3 stagger" data-reveal>
            {AIMS.map((a) => (
              <div className="card" key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="wrap center" data-reveal>
        <p className="eyebrow">Be part of it</p>
        <h2 style={{ fontSize: "var(--step-3)", maxWidth: "22ch" }}>
          Every door opened begins with someone willing to open it.
        </h2>
        <p className="lede">
          Whether you mentor a student, share your expertise, or support the Foundation directly -
          you become part of the bridge we&rsquo;re building.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary btn-lg" href="/donate">
            Support a mentee
          </Link>
          <Link className="btn btn-ghost btn-lg" href="/contact">
            Volunteer as a mentor
          </Link>
        </div>
      </section>
    </>
  );
}
