"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Trophy, Zap, Users, Gamepad2 } from "lucide-react"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { CountUp } from "@/components/ui/count-up"
import { ProgressRing } from "@/components/game/ProgressRing"
import { PrayerTimesCard } from "@/components/game/PrayerTimesCard"
import { SalaamGreeting } from "@/components/game/SalaamGreeting"
import { DailyHadith } from "@/components/game/DailyHadith"
import { HomeRewardsCard } from "@/components/home/HomeRewardsCard"
import { ReviewCallout } from "@/components/game/ReviewCallout"
import { LogoutButton } from "@/components/layout/LogoutButton"

import { useProfile } from "@/hooks/use-profile"
import { playCue } from "@/lib/sound"
import { playHaptic } from "@/lib/haptics"
import { takeStreakAdvance } from "@/lib/streak-cue"
import { useLifetimeStats } from "@/hooks/use-lifetime-stats"
import { rankProgress } from "@/lib/ranks"
import { useLanguage } from "@/contexts/LanguageContext"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HomePage() {
  const { profile, loading } = useProfile()
  const { answered: lifetimeAnswered, accuracy: lifetimeAccuracy } = useLifetimeStats()
  const { t, dir } = useLanguage()
  const [currentTime, setCurrentTime] = useState("")


  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  /**
   * The streak, heard the first time the player sees it move.
   *
   * Waits for `loading` to clear: `useProfile` reports 0 before the profile
   * arrives, and celebrating that would first record a streak of nothing and
   * then fire on the very next render when the real number landed.
   *
   * `takeStreakAdvance` consumes the advance, so this stays correct under
   * strict mode's double effect run and across the re-renders the two card
   * requests cause as they resolve.
   */
  useEffect(() => {
    if (loading) return
    if (!takeStreakAdvance(profile?.streakCount ?? 0)) return
    playCue("streak")
    playHaptic("streak")
  }, [loading, profile?.streakCount])

  const reduceMotion = useReducedMotion()
  /** The ladder the ring is measured against — never the size of the bank. */
  const rank = rankProgress(profile?.totalXp ?? 0)
  const streakAlive = (profile?.streakCount ?? 0) > 0

  return (
    <div dir={dir} className="relative min-h-[100dvh] bg-background pb-32">
      {/* The backdrop lives in `(app)/layout.tsx`, which this page renders
          inside. It used to be repeated here verbatim, so the home screen drew
          two gold blurs, two secondary blurs and two copies of the pattern on
          top of each other: the ornament was twice as strong here as on every
          other screen, and it cost an extra compositing layer on the most
          visited page in the app. */}

      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 h-16"
      >
        <div className="flex justify-between items-center px-5 h-full max-w-7xl mx-auto">
          {/* The player's own face, linking to their profile. This used to be a
              hardcoded silhouette: onboarding asked everyone to choose an
              avatar, stored the choice, and then no screen in the app ever drew
              it. Showing it here is the cheapest identity win available — the
              first thing you see on opening the app is you. */}
          <Link href="/profile" className="flex items-center gap-3 group min-w-0">
            <PremiumAvatar
              size="sm"
              ring
              ringColor="primary"
              avatarId={profile?.avatarId}
              className="shrink-0 transition-transform group-active:scale-95"
            />
            {/* The greeting moved into <main> as <SalaamGreeting />. It used to
                live here behind `hidden sm:block`, a 640px width breakpoint no
                phone reaches in portrait, so no phone user ever saw it. The
                wordmark stays and is shown at every size. */}
            <h1 className="font-headline-md text-headline-md bg-gradient-to-br from-[#f6dfa0] via-primary to-[#c9962f] bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(240,205,109,0.25)]">
              ILM Hunt
            </h1>
          </Link>
          {/* Streak and coins. Both numbers climb rather than snap, and the
              flame only breathes while a streak is actually alive — a cold
              streak sitting still is information, not an oversight. */}
          <div className="flex items-center gap-4 bg-surface-container-high/40 px-4 py-1.5 rounded-full border border-white/5">
            <div className="flex items-center gap-1.5">
              <CountUp value={profile?.streakCount ?? 0} className={`tabular-nums ${streakAlive ? "text-warning" : "text-on-surface-variant"}`} />
              <motion.svg
                /* A live streak is warm. This drew a `tertiary` mint flame with a
                   hardcoded orange halo, the same contradiction the combo badge
                   carried: green fire giving off orange light. Warm ramp now,
                   and the glow is `currentColor` so the two cannot drift apart. */
                className={`w-4 h-4 ${streakAlive ? "text-warning drop-shadow-[0_0_6px_currentColor]" : "text-on-surface-variant/40"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                animate={streakAlive && !reduceMotion ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                transition={{ duration: 1.7, repeat: streakAlive && !reduceMotion ? Infinity : 0, ease: "easeInOut" }}
              >
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
              </motion.svg>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <CountUp value={profile?.coins ?? 0} className="text-primary-fixed tabular-nums" />
              <svg className="w-4 h-4 text-primary-fixed" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.98-3.12 3.19z" />
              </svg>
            </div>
          </div>
          <LogoutButton className="flex items-center justify-center h-9 w-9 rounded-full text-on-surface-variant/70 hover:bg-white/5 hover:text-error transition-colors" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mt-20 px-5 max-w-7xl mx-auto space-y-4 relative">
        {/* Salaam, name, rank. First thing on the page, on every screen size. */}
        <SalaamGreeting />

        {/* The hadith card, finally on screen. It was imported by this file and
            never rendered, so a built, styled and fully translated component
            had been invisible to every player. It leads because it is the one
            thing here that is not a number: opening on rings and streak counts
            makes a scoreboard, and this is meant to be a place of study. */}
        <DailyHadith />

        {/* The day's invitation, on the front door.

            The daily challenge card stood here, and the position is the point
            — it sits above the ring because the ring is a record of what has
            been done and this is the invitation to do something today, and the
            invitation goes first.

            What changed is where it leads. The daily challenge and the daily
            login reward were the same five questions on the same day, on two
            screens, under two names — and the login one sent the player to the
            category grid. They are one panel on the Rewards Center now, so the
            front door points there: same slot, same invitation, one
            destination. That also retires the `/rewards` tile from the Explore
            grid below, which was the app's only other link to the page. */}
        <HomeRewardsCard />

        {/* Prayer times, directly under the greeting. This is the real card:
            it locates the seeker, counts down to the next salah, and rolls over
            to tomorrow's Fajr after Isha. What used to sit further down the
            page was a hardcoded panel that always read "Dhuhr, in 2h 15m". */}
        <PrayerTimesCard />

        {/* What is due for spaced review. Renders nothing when the queue is empty. */}
        <ReviewCallout />

        {/* The player's whole journey, in one band.

            This used to be "Today's progress": a ring filling toward ten
            questions a day, reset every midnight. Two things were wrong with
            it. It threw away everything the player had ever done at the moment
            they most wanted to see it — open the app on a new day and the front
            door says 0%, having forgotten a month of study. And ten a day was a
            goal nobody had agreed to; missing it read as failure for a person
            who answered nine.

            ── The denominator problem, which is why the ring shows rank ──────
            The obvious fix is a percentage of the bank, and it is the one thing
            this app must not do. Stating the size of the question bank hands
            the player a denominator, and from then on every run is measured
            against finishing rather than against learning — which is why the
            total was removed from `/intro` and `/quiz`. `answered / 5,220`
            would have put it back on the busiest screen in the app.

            So the ring is progress toward the next rank instead. It is a real
            total — it only ever goes up, and it survives midnight — but it is
            measured against the player's own next step rather than against the
            end of the corpus. `rankProgress` already computes it from
            `total_xp`, the same ladder the profile and the rank-up cue use, so
            there is no second definition to drift.

            The two numbers beside it are lifetime and unbounded: questions
            answered, and accuracy across all of them. Counts about the player
            are fine; it is the bank's size that stays private. */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-card p-4 sm:p-5"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
              <ProgressRing progress={rank.percent} size={96} strokeWidth={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-headline-md text-headline-md text-primary tabular-nums">
                  <CountUp value={Math.round(rank.percent)} format={(n) => `${n}%`} />
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                {t("overallProgress")}
              </p>
              {/* At the top of the ladder there is no "next", and inventing one
                  would be a lie on the screen. */}
              <p className="font-bold text-headline-md text-on-surface mt-0.5 break-words">
                {rank.isMax || !rank.next
                  ? rank.rank.title
                  : t("rankJourney", { current: rank.rank.title, next: rank.next.title })}
              </p>

              <div className="flex gap-6 mt-3">
                <div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
                    </svg>
                    <span className="font-bold text-title-md text-on-surface tabular-nums">
                      <CountUp value={lifetimeAnswered} />
                    </span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">
                    {t("questionsAnswered")}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z" />
                    </svg>
                    {/* Null until the first answer. Interpolating it once
                        rendered a bare "%" with no number in front of it. */}
                    <span className="font-bold text-title-md text-on-surface tabular-nums">
                      {lifetimeAccuracy === null ? "\u2014" : `${lifetimeAccuracy}%`}
                    </span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest">
                    {/* "Accuracy", as it is called on the profile and on the
                        run summary. This said "Focus Level" — a term that
                        appears nowhere else in the app — for the same lifetime
                        accuracy figure, and it sat inches from the rank ring's
                        percentage. Two percentages side by side, meaning
                        different things, one of them named after nothing. */}
                    {t("accuracy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* The "Continue learning" card and the "Daily mission" card both
            stood here and are both gone.

            Continue learning duplicated the Learning tab in the bottom bar,
            which is on this screen at all times and goes to the same place. On
            a cold start it read "Pick a category", which is precisely what the
            tab already says, so the front door offered the same door twice.

            The daily mission — "Answer 5 questions" — was the harder call. It
            was not redundant, it was misplaced: it stated a task with no
            reward attached to it on the screen, while the reward it should
            have been attached to sat further down paying out for nothing. The
            two are now one thing, on `/rewards`: the questions are the price
            of the daily coins, stated where the coins are collected. Migration
            0053 enforces it in the database. */}

        {/* The "Daily login rewards" row stood here, directly under the
            progress card, and is gone at the owner's request: with the daily
            challenge card now above the ring, two separate "here is your daily
            thing" rows bracketed the overall progress and neither said which
            was which.

            It was also the only link to `/rewards` in the entire app, so it
            could not simply be deleted — the daily login reward, the spin
            wheel and the streak freeze would all have become unreachable, the
            exact failure this session has already fixed twice. It moves into
            the Explore grid below, where the other rooms live. */}

        {/* Explore - the only entry point to these pages besides typing the URL.

            These were four flat emoji on four identical grey cards, which made
            the four most interesting rooms in the game — achievements, daily
            challenges, the community, live multiplayer — read as a row of
            filing cabinets. Each now has its own colour and a real icon, lifts
            under the cursor and presses under a thumb, and they arrive in
            sequence rather than all at once. Same four links, same four
            strings; only the invitation changed. */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
        >
          {[
            { href: "/achievements", label: t("achievements"), Icon: Trophy, tint: "from-warning/25 to-warning/10", fg: "text-warning-bright" },
            { href: "/challenges", label: t("challenges"), Icon: Zap, tint: "from-special/25 to-special-container/10", fg: "text-special-bright" },
            { href: "/community", label: t("communityHub"), Icon: Users, tint: "from-info/25 to-info-container/10", fg: "text-info-bright" },
            { href: "/multiplayer", label: t("multiplayerQuiz"), Icon: Gamepad2, tint: "from-success/25 to-success/10", fg: "text-success-bright" },
            /* Rewards is no longer here. It was the app's only link to
               `/rewards` when it was added, and now the card above the ring is
               a better one: the daily challenge lives on that page, so the
               front door's daily invitation and the route to the Rewards
               Center are one link rather than two that compete. Four tiles
               again, and none of them `wide`. */
          ].map(({ href, label, Icon, tint, fg }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
            >
              <Link
                href={href}
                className="glass-card p-4 h-full flex flex-col items-center text-center gap-2 transition-all hover:bg-white/5 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tint} ring-1 ring-white/10`}
                >
                  <Icon className={`h-5 w-5 ${fg}`} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-on-surface">{label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* The home screen used to render its own copy of the bottom navigation
          here, on top of the one `(app)/layout.tsx` already draws for every
          page inside it. Two fixed nav bars, stacked, on the most visited
          screen in the app — visible in a browser as the tab row printed
          twice, and a second full-width fixed element the phone had to
          composite on every scroll.

          They had drifted, too, which is the part that matters: this copy
          linked Rankings to `/leaderboard` and Shop to `/store` with its own
          icons and its own active state, while the layout's copy kept its own.
          Two navigations for one app is two places to add the next tab to, and
          only one of them would have been remembered. */}
    </div>
  )
}
