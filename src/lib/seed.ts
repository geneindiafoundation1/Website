import type { Member, Post } from "./types";

/**
 * Fallback content, used whenever Supabase is not configured.
 * Once the database is live these same rows are seeded via supabase/seed.sql
 * and the admin panel becomes the source of truth.
 */

export const seedPosts: Post[] = [
  {
    id: "seed-1",
    slug: "the-foundations-we-forget-to-build",
    title: "The Foundations We Forget to Build",
    excerpt:
      "We spend enormous energy on houses and weddings. Are we giving the same attention to the young people who will inherit all of this?",
    category: "Reflections",
    cover_url: "/blog/foundations.jpg",
    published: true,
    published_at: "2026-09-18",
    read_minutes: 3,
    body: `Kashmir has always stood at the crossroads of different civilizations. Our traditions and cultural influences go back thousands of years, and what we call Kashmiri culture today is really a beautiful mix of all those histories, values, and influences. We inherit much of it from our families, but we also pick up a lot from the society around us, often without even realizing it.

“We love big. We celebrate big. And, unfortunately, we waste big too.”

With the wedding season in full swing, I find myself wondering how we have slowly, almost unknowingly, built a culture around display, extravagance, and keeping up appearances. When did celebrating become so closely tied to how much we can spend, show, and consume? When did having “more” become a measure of doing “better”?

But another question bothers me even more: what kind of legacy are we leaving for our children?

Do our children have enough support to figure out who they are and what they want to do with their lives? Are we as generous with our time at home as we are with our money at weddings and celebrations? Do we spend enough time listening to them, understanding their struggles, and helping them navigate an increasingly complicated world?

Our young people are growing up in a time of intense competition, limited opportunities, uncertainty, and increasing pressure. Yet, somehow, we seem far more comfortable talking about marks, jobs, status, and “what people will say” than about their emotional well-being or the kind of support they actually need. Perhaps this isn't just a Kashmiri issue. Across India, we often place a great deal of importance on social display while paying much less attention to social responsibility. We are quick to demand our rights, but sometimes less willing to talk about our responsibilities. And when those responsibilities require consistency, patience, or personal sacrifice, our enthusiasm can quickly fade.

Sometimes I wonder: what if we invested in our children's education and futures with the same energy with which we build our homes and spend on Wazwan at the wedding? Even better, and more aspirational, what if we invested those funds in the education of children whose parents can't pay for it? What if we were as concerned about the foundations of their lives as we are about the foundations of our houses and paying for extravagant weddings? What if we held those conversations around the dinner table, with the entire family as stakeholders?

“What if we simply listened to our children a little more, and were truly present, patient, and supportive?”

We spend enormous amounts of time and money building beautiful, majestic houses. We organize elaborate weddings. We worry about maintaining a certain name and standing in society. But are we giving the same attention to the young people who will inherit all of this? Our children don't just need good schools. They need attentive parents and guardians who are there for them, not just physically, but emotionally. They need mentors, role models, encouragement, honest conversations, and the freedom to make mistakes without feeling that they have failed. They need help understanding that their worth is not determined by marks, salaries, social status, or how they compare with someone else.

Maybe the real question isn't whether we are doing enough for our children. It is whether our priorities are in the right place. Because one day, our houses will age, the weddings will be forgotten, and the photographs will gather dust. What will remain is the generation we raised, and the values, confidence, compassion, and resilience we gave them. And that, perhaps, is the legacy worth investing in.`,
  },
  {
    id: "seed-2",
    slug: "breaking-the-inheritance-of-limitations",
    title: "Breaking the Inheritance of Limitations for a Confident Future",
    excerpt:
      "Education should never be a luxury. Mentorship is how we stop celebrating only those who escaped the odds, and start changing the odds themselves.",
    category: "Mentorship",
    cover_url: "/blog/limitations.jpg",
    published: true,
    published_at: "2026-09-16",
    read_minutes: 5,
    body: `Kashmir has witnessed its share of upheavals. We have inherited conflicts we did not create, and we have grown up carrying the weight of experiences that were often beyond our control. And when you grow up in conflict, irrespective of its source, even something as fundamental as education can begin to feel like a luxury.

But education should never be a luxury; it is, along with healthcare, an infrastructure priority at state and national level.

It should be the one thing that allows a child to look beyond the circumstances they were born into and say, “I can become something more for my future and to become a responsible part of the community.” For far too long, we have invested too little in building the kind of educational ecosystem our young people deserve. We may educate them, but are we preparing them? Are we teaching them to communicate, think critically, navigate the world, build relationships, find opportunities, and, most importantly, believe they belong in those spaces?

If we do a blind, well-structured, and unbiased survey with statistical power across multiple geographic settings, the answer will be a big No.

We often celebrate our success stories, which are often based on a very small sample size. And we should celebrate that, but we should also think about replicating it at scale. We talk about the young person from Kashmir who made it to a great university, the scientist who made it internationally, the doctor, the entrepreneur, the civil servant, the one who somehow managed to rise above every obstacle. But I often wonder:

Why do we have to celebrate only the ones who managed to escape the odds?

What if we could change the odds themselves?

What if success did not have to be an exception?

What if our children did not have to be extraordinarily resilient simply to access ordinary opportunities?

I remember, as a young woman, reading Kamala Das and coming across the beautiful idea that we often dream in our mother tongue. I loved that thought. I wondered what it meant to dream in Kashmiri or think in Kashmiri as I prepared the big next step. To dream and plan in the language of our mothers and grandmothers. To dream amidst our mountains, our rivers, our markets and busy streets, our stories and our history. To imagine a future without having to first imagine leaving everything familiar behind.

Because being Kashmiri comes with baggage. We carry a complicated history. We carry memories, hurt and confusion. We carry frustrations about what we do not have: limited opportunities, inadequate infrastructure, and support systems that are often missing. And yet, alongside all of that, we carry something incredibly powerful: a legacy, a commitment to succeed, share, ask questions, find solutions and inform each other so that the end products are the sum of individual efforts.

Our young people today are growing up in a very different world; on one hand, the needed infrastructure is lacking, and on the other, global educational systems are moving fast. Through technology, data science, and advances in health sciences and biotechnology, humanities, arts, and AI, they can see possibilities that previous generations could never have imagined. They can look across the world and discover careers, universities, ideas and opportunities that are no longer geographically distant. But seeing an opportunity is not the same as knowing how to reach it. That's where mentorship becomes powerful and is needed.

Many of us have travelled beyond these boundaries to know what it feels like to stand alone at a crossroads without a map. We have made mistakes. We have taken wrong turns and often walked slowly in an environment where others had a clear line of sight through networking and effective mentorship. Some may have knocked on doors that did not open. We have struggled to understand systems that others seemed to navigate effortlessly. But perhaps those struggles have given us something valuable: a responsibility.

A responsibility to turn around and say to the person coming behind us:

“I have been here. I know this road. Let me show you what I have learnt.”

Ralph Waldo Emerson spoke of travelling paths where there are no roads and leaving a trail for others to follow.

I think that is one of the most beautiful ways to think about mentorship. We do not mentor simply to create successful individuals. We mentor to make the journey easier for the next person and to help them continue the legacy. If we had to find our own way, let us leave a map. If we had to knock on a hundred doors, let us help the next generation find the right door. If we were once told that something was impossible, let us be the people who tell our young people:

“Try.”

“Dream.”

“Go further.”

“You belong there.”

Because in today's world, where competition is intense and opportunities can seem overwhelming, success cannot simply be about how far we climb. Perhaps the real measure of our success is how many people we help climb with us. Sometimes mentorship is teaching. Sometimes it is guidance. Sometimes it is opening a door. Sometimes it is making a phone call, sharing an email, reading an application, introducing someone to the right person, speaking to a mentee to lessen the burden, or simply telling a young person, “I believe you can do this.” And sometimes, that is enough to change the trajectory of a life.

For me, this is what giving back means. It is about preparing our young people not just to become scientists, doctors, engineers, entrepreneurs or intellectuals, but to become confident, responsible, empathetic and kind human beings. Because ultimately, the future of Kashmir will not be defined only by the challenges we inherited. It will be defined by what we choose to build despite them. We cannot rewrite the past. But we can influence what comes next. And perhaps our greatest responsibility is to ensure that the children who come after us do not inherit only our conflicts and our limitations.

Let them inherit our knowledge.

Let them inherit our courage.

Let them inherit our dreams.

And, most importantly, let us leave them a trail.`,
  },
  {
    id: "seed-3",
    slug: "leaving-a-trail",
    title: "Leaving a Trail: Mentorship, Opportunity and the Future of Our Youth",
    excerpt:
      "Mentorship isn't a nice-to-have. For students in Jammu, Kashmir and Ladakh, it is often the difference between wandering and walking with direction.",
    category: "Access",
    cover_url: "/blog/trail.jpg",
    published: true,
    published_at: "2026-09-13",
    read_minutes: 5,
    body: `I keep coming back to one memory whenever someone asks me why mentorship matters so much to me: a bright teenager, full of questions, who had no one to ask them to. Not because the questions weren't worth asking; they were sharp, curious, sometimes better than the ones adults ask, but because there was no mentor around who was willing to speak, share experience, and walk even one step further down the road this kid wanted to take. That gap, more than any lack of talent or ambition, quietly decides who realises her/his big dreams with confidence and who struggles and doesn't.

That's the thing about mentorship that I don't think gets said enough, and it needs to be mainstreamed in early schooling. It isn't a nice-to-have, a resume line, or something reserved for people who already have it figured out. It's the difference between wandering and walking with direction. A good mentor doesn't hand you a map, exactly; they help you realise you're allowed to draw your own. For a young person standing at the edge of adulthood, unsure whether the world has any room for what they actually want to do, that reassurance can be the whole ballgame. While parents and extended family members have a role, a mentor comes from outside and can relate to the mentee honestly and directly, in a professional way.

## The weight Kashmir and Ladakh's students are carrying

Looking closely at education in Jammu and Kashmir and Ladakh, one starts to understand why mentorship isn't a luxury there; it's an urgent need and almost a rescue mission. The numbers are alarming. Jammu and Kashmir has been without fresh teacher recruitment since 2019, leaving roughly 4,200 lecturer posts vacant and over 1,371 schools running on a single teacher for more than 32,000 students combined. Nearly 1,900 government schools still don't have separate toilets for girls, and 8.5% have no electricity at all. Only about 1.5% of schools have a digital library. And the learning gap this creates is stark: just 21.8% of fifth-graders in government schools can read a second-grade-level passage, compared to 60.3% in private schools. It isn't that children in government schools are less capable. The system around them is stretched impossibly thin and is failing them.

Ladakh's story is its own kind of hard. Winters there aren't just cold; they're structurally disruptive. Board exams held in February and March mean students trek through one to three feet of snow to sit for tests that decide their futures. Curriculum shifted abruptly from the old state board to CBSE with little consultation about what that transition would actually cost these students, and the results speak for themselves: Kargil's Class 10 pass rate fell from 88.82% to 45.2% in just a couple of years. Meanwhile, 116 government schools across the region have shut down entirely due to zero enrollment, as families who can afford it drift toward private schools they see as safer bets. Dropout rates in Ladakh, at nearly 20% by secondary school, are among the highest anywhere in the country.

And underneath all of this sits a quieter, less visible problem: even the students who do make it through often have no real guidance about what comes next. Ask a teenager in Kashmir what they want to be, and the answer is almost scripted: doctor, engineer, or a government job, not because those are the only things young people there are capable of, but because those are the only paths anyone has ever properly explained to them. There simply aren't enough trained counsellors, enough exposure to other fields, or enough adults willing to sit down and say, “here's what a career in design, or public policy, or conservation, or entrepreneurship could actually look like for you.” Coaching centers are everywhere. Real guidance is rare and at times absent.

## Where mentorship actually fits in

This is exactly the gap mentorship is designed and built to fill, and it doesn't require solving the entire education crisis first. You can't rebuild school infrastructure or recruit thousands of teachers overnight, but you can put a working professional in a video call with a tenth-grader in Kargil or a college student in Anantnag and let them ask every question they've been sitting on.

You can normalize the idea that “I don't know what I want to do yet” isn't a failure; it's just the beginning of a conversation.

A mentor does something a classroom, by its nature, often can't: they see one student, not forty or four hundred. They notice the kid who's quietly good at something nobody's pointed out yet. They can say, honestly, “I've been where you're standing, and here's what I wish someone had told me.” For young people navigating career paths that look nothing like their parents' or grandparents', paths in tech, the creative industries, research, social impact, business, that kind of firsthand, specific guidance matters more than any pamphlet or career fair ever could.

I also think mentorship builds confidence in ways curriculum reform, however necessary, can't do or touch directly. When a student from a remote village in Ladakh or a remote town in Kashmir gets to talk regularly with someone who's built a career they admire, it quietly rewires what feels possible. The ceiling moves, and desirable starts becoming feasible. Suddenly “doctor, engineer, or government job” isn't the whole conversation anymore; it's one option among many, and the student gets to choose rather than default.

None of this replaces the urgent, structural work that still needs doing. Teachers need to be hired and trained at regular levels; schools need heating, toilets, and reliable electricity; curricula need to fit the regions they're taught in. But mentorship is something we can build in parallel, right now, without waiting for policy to catch up. It costs relatively little and asks relatively little, just time, honesty, and a willingness to show up for a young person who's asking better questions than they're being given credit for.

That teenager I mentioned at the start didn't need someone for all the answers. They needed someone to take the questions seriously. I think that's true for so many young people across Jammu, Kashmir and Ladakh right now, and I think it's one of the more solvable problems we have in front of us, if enough of us decide to show up for it. And this teenager mentee becomes the mentor for another young mentee in the cycle of mentorship.`,
  },
];

export const seedTeam: Member[] = [
  {
    id: "seed-m1",
    slug: "upendra-kaul",
    name: "Dr. Upendra Kaul",
    role: "Director · Interventional Cardiology",
    photo_url: "/team/upendra-kaul.jpg",
    sort_order: 1,
    published: true,
    tags: ["450+ papers", "400+ cardiologists trained", "Padma Shri", "Dr. B.C. Roy Award"],
    bio: `One of India's most distinguished interventional cardiologists and a pioneer of the field in the country. He introduced percutaneous transluminal coronary angioplasty (PTCA) to India in the 1980s and established one of the nation's first balloon angioplasty programs at AIIMS, New Delhi.

Over a career spanning decades, he has authored more than 450 medical papers and personally trained over 400 cardiologists through structured mentorship at AIIMS, Fortis, and Batra Heart Centre, where he currently serves as Chairman and Dean of Academics and Research. His contributions have been recognized with the Dr. B.C. Roy Award, India's highest medical honour, and the Padma Shri, one of the country's highest civilian awards.

At GENE-INDIA Foundation, Dr. Kaul brings a lifetime of mentorship experience and a personal commitment to nurturing the next generation of healthcare professionals.`,
  },
  {
    id: "seed-m2",
    slug: "tanzila-mukhtar",
    name: "Dr. Tanzila Mukhtar",
    role: "Director · Neurobiology",
    photo_url: "/team/tanzila-mukhtar.jpg",
    sort_order: 2,
    published: true,
    tags: ["Neuroscience", "Programs & partnerships", "Grassroots impact"],
    bio: `A young neurobiologist whose work sits at the intersection of scientific rigor and social purpose. Driven by a firsthand understanding of how far talent can be limited by a lack of access rather than ability, she co-founded GENE-INDIA Foundation to build the kind of mentorship network she wished existed for students navigating the sciences on their own.

Her research background gives her a deep appreciation for structured guidance and long-term thinking - qualities she now channels into shaping GENE-INDIA's programs, partnerships, and vision for grassroots impact across India.`,
  },
];
