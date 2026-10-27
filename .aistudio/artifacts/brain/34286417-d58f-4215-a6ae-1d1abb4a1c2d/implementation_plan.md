# SkillUp Tech - Tech Learning & Daily Streak Platform

A responsive, high-engagement tech learning web application where learners build in-demand digital skills (Data Analytics, AI Automation, Python, Digital Marketing, and Prompt Engineering), maintain daily learning streaks, test their knowledge with interactive quizzes, and seamlessly sync progress via Firebase Authentication and Cloud Firestore.

## User Review & Critical Decisions

> [!IMPORTANT]
> Key architectural decisions confirmed during initial interview:
> - **Open Exploration**: Learners can navigate and explore any track, module, and lesson freely without artificial hard locks, while retaining automatic completion tracking and resume states.
> - **Milestone Celebrations**: Completing lessons and quizzes triggers micro-celebration confetti animations and unlocks milestone streak badges.
> - **Interactive Quick Practice**: Lessons feature embedded runnable mini-sandboxes (Python output simulator, prompt tester, and interactive formula checks) alongside concise takeaways.
> - **Firebase Provisioning**: Firebase Auth (with Google Sign-In and Email/Password support) and Firestore database will be provisioned using AI Studio UI flow in Phase 3.

---

## 1. Overview & Core Concept

**SkillUp Tech** empowers aspiring and working tech professionals to cultivate consistent daily learning habits. By breaking down high-demand digital topics into focused, bite-sized lessons with practical takeaways and module-level quizzes, users make measurable progress every day.

- **Target Audience**: Self-directed learners, career switchers, and professionals building competencies in data, automation, programming, marketing, and generative AI.
- **Key Value Proposition**: Habit-forming streak mechanics paired with practical micro-curricula that preserve exact state and resume positions across any device.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Authentication & Profile Setup**:
   - Welcome modal supporting Google Sign-In and Name + Email/Password registration.
   - Captures learner's display name to personalize greetings throughout the app.
   - Fallback guest exploration mode with immediate option to link an account without losing streak or completed lessons.

2. **Dashboard Command Center**:
   - Bold uppercase greeting: `"WELCOME, [USER'S NAME]"` (e.g., `WELCOME EMMANUEL`).
   - Prominent **Daily Streak Banner**: Displays current streak (`🔥 5-day streak`), longest streak recorded, and an interactive 7-day weekly activity grid (Mon–Sun) highlighting completed study days.
   - **Continue Learning Hero Card**: One-click resume button navigating directly to the learner's last visited lesson with track title, module badge, and progress percentage.
   - **Quick Stat Overview**: Total lessons completed, average quiz score, and active tracks.

3. **Track Exploration (`Explore`)**:
   - 5 structured skill tracks:
     1. **Data Analytics**: Data wrangling, SQL fundamentals, statistical thinking, and dashboard visualization.
     2. **AI Automation**: Workflow webhooks, Zapier/Make integrations, autonomous agent pipelines, and API triggers.
     3. **Python Programming**: Core syntax, control flow, functions, data structures, and practical scripts.
     4. **Digital Marketing**: Funnel metrics, conversion optimization, SEO architecture, and paid acquisition.
     5. **Prompt Engineering**: System framing, few-shot prompting, chain-of-thought logic, and output validation.
   - Each card features overall track progress bar, estimated completion time, module counts, and a direct `"Start Track"` or `"Resume Track"` action.

4. **Lesson & Quiz Player**:
   - Clean, readable reading pane with key takeaways highlighted in soft light-blue cards.
   - Interactive live practice widgets (e.g. prompt playground and simulated Python console).
   - "Mark as Complete" action that persists progress, updates the daily streak, and plays subtle celebratory confetti.
   - Module quiz view: 3–5 scenario-based questions with instant explanation feedback, scoring, and retake capabilities.

5. **My Progress & Activity History**:
   - Detailed completion matrix across all 5 tracks.
   - Streak history calendar view and earned milestone badges (First Lesson, 3-Day Flame, Perfect Quiz, Track Master).

### Visual Identity & Theme

- **Color Discipline (Blue & White Only)**:
  - Dominant Canvas (60%): Crisp pure white (`#FFFFFF`) and ultra-soft blue-tinted slate (`#F8FAFC`).
  - Structural Panels & Cards (30%): Soft light blue accent card backdrops (`#EAF1FF`), clean hairline borders (`#D0E0FF`), and deep navy text (`#0D1E4C`) for WCAG AAA contrast.
  - Primary Action Accent (10%): High-energy primary blue (`#1E5EFF`) for buttons, active navigation states, and streak flames.
- **Typography**:
  - Headings: Display Neo-Grotesque (`Plus Jakarta Sans` / modern system font hierarchy) with balanced text wrapping.
  - Body: Crisp, high-legibility body prose (15–16px, 1.6 line height).
  - Telemetry & Code: Clean monospace with tabular numerals (`tabular-nums`) for streak counts, percentages, and code examples.
- **Navigation Contract**:
  - Desktop & Tablet: Fixed left sidebar containing brand wordmark `SkillUp Tech`, 4 primary navigation items (Dashboard, Explore, My Progress, Profile), and user status badge.
  - Mobile: Ergonomic fixed bottom navigation bar (under 15% viewport height) with clear icon-and-label tabs.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Alternatives Considered |
|---|---|---|
| **Data Persistence** | Firebase Auth + Cloud Firestore with LocalStorage cache fallback | Enables real-time multi-device synchronization while ensuring guest offline resilience if disconnected. |
| **Streak Calculation** | Normalized Calendar Day comparison (`YYYY-MM-DD` localized) | Evaluates delta in calendar days between `lastActiveDate` and `today`: same day maintains count, consecutive day increments +1, gap $\ge 2$ days resets to 1 while retaining all-time longest streak. |
| **Content Architecture** | Self-contained curriculum dataset with 5 complete tracks | Allows instantaneous loading, zero lag, zero external broken links, and reliable offline exploration. |
| **Lesson Progression** | Open Exploration with clear visual state indicators | Promotes learner autonomy and self-pacing over frustrating rigid locks. |

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SkillUp Tech Web App                          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────┐                         ┌────────────────────┐
│   Auth & User Session   │                         │  Track Curriculum  │
│  (Firebase Auth + State)│                         │  (5 Domain Tracks) │
└──────────┬──────────────┘                         └─────────┬──────────┘
           │                                                  │
           ├─────────────────────────┬────────────────────────┤
           ▼                         ▼                        ▼
┌─────────────────────┐   ┌──────────────────────┐  ┌────────────────────┐
│      Dashboard      │   │     Explore View     │  │   Lesson Player    │
│ - Uppercase Welcome │   │ - 5 Skill Cards      │  │ - Key Takeaways    │
│ - Streak Banner     │   │ - Progress % Bars    │  │ - Interactive Run  │
│ - Weekly Mon-Sun    │   │ - Module Drawers     │  │ - Mark Complete    │
│ - Continue Learning │   │ - Quiz Launchers     │  │ - Module Quiz      │
└──────────┬──────────┘   └──────────┬───────────┘  └─────────┬──────────┘
           │                         │                        │
           └─────────────────────────┼────────────────────────┘
                                     ▼
                   ┌──────────────────────────────────┐
                   │    State Sync & Streak Engine    │
                   │ - Daily streak increment/reset   │
                   │ - Completed lesson IDs set       │
                   │ - Quiz scores & lastLessonViewed │
                   └─────────────────┬────────────────┘
                                     │
                                     ▼
                   ┌──────────────────────────────────┐
                   │   Cloud Firestore & Firestore    │
                   │   Security Rules (ABAC Owner)    │
                   └──────────────────────────────────┘
```

### Firestore Data Model (`firebase-blueprint.json` schema)

- **Collection**: `/users/{userId}`
  - `name`: string (e.g. "Emmanuel")
  - `email`: string
  - `streakCount`: number (e.g. 5)
  - `longestStreak`: number (e.g. 12)
  - `lastActiveDate`: string (`YYYY-MM-DD`)
  - `activeDays`: array of string dates (`YYYY-MM-DD`)
  - `completedLessons`: array of lesson IDs (e.g. `['python-1-1', 'data-1-2']`)
  - `quizScores`: map of module ID to score percentage (e.g. `{'python-m1': 100}`)
  - `lastLessonViewed`: object `{ trackId, moduleId, lessonId, title, timestamp }`
  - `updatedAt`: timestamp

### Interactive Component & State Mapping

- **Auth Modal**: Handles sign-in, registration with name capture, and guest exploration fallback.
- **Streak Tracker**: Computes active days for the current Monday–Sunday week window, rendering flame icons and highlight badges.
- **Lesson Player**: Toggles completion in state, updates Firestore document, triggers celebratory micro-confetti, and transitions smoothly to next lesson.
- **Module Quiz Component**: Multi-question assessment with question stepping, instant explanation cards, and score calculation.

---

## 5. Execution Steps

1. **Step 1: Firebase Provisioning**: Trigger Firebase Setup modal via `show_aistudio_ui`, check ToS acceptance, invoke `ProvisionFirebase`, and configure `firebase-blueprint.json` & `firestore.rules`.
2. **Step 2: Core State & Curriculum Data**: Build rich lesson content for all 5 tracks with modules, takeaways, and quiz questions; create reactive Auth and Progress contexts with streak computation.
3. **Step 3: Layout & Navigation Shell**: Implement responsive Sidebar (desktop) and Bottom Navigation (mobile) with blue-and-white theme.
4. **Step 4: Dashboard & Streak Engine**: Render the uppercase greeting, streak banner, weekly calendar, and Continue Learning action.
5. **Step 5: Explore & Player Experience**: Build track overview cards, module curriculum breakdown, lesson viewer with practice sandbox, and quiz module.
6. **Step 6: Verification**: Run `compile_applet` and verify zero errors, complete touch targets, and full responsiveness.
