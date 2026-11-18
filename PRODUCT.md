# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Personal trainers manage students, exercises and assigned training plans, often from a desktop but also from a phone between sessions.
- Students consult and execute assigned workouts on a phone, frequently in a gym and without the trainer physically present.

## Product Purpose

MyPersonal.App lets personal trainers prepare and distribute strength and functional training plans so students can train independently while remaining connected to the trainer's guidance. Success means both roles can complete their core task quickly on a phone, with the student able to understand what to do next throughout a workout.

## Positioning

The product connects the trainer's planning workflow directly to the student's guided workout execution, preserving the sequence, instructions, rest timing and feedback loop even when they are apart.

## Operating Context

- Trainers repeatedly search, create and edit students, exercises and training plans.
- Students use the product one-handed around gym equipment, moving through exercises, series, rest timers and video references.
- The product is installed from the web on Android and iPhone and is also used in desktop browsers.
- API-backed data and mutations require a network connection; the application shell may remain available offline to explain that state.

## Capabilities and Constraints

- Existing React, MUI, React Router and NestJS/MongoDB API contracts are preserved.
- Existing `user` and `auth-token` local-storage formats remain compatible.
- Training progress uses the existing start, current, cancel and finish endpoints.
- The UI remains in Brazilian Portuguese.
- Profile editing, calendar, push notifications, app-store packaging and full offline data synchronization are outside the current scope.

## Brand Commitments

- “MyPersonal.App” is the default identity when a personal has not configured a white-label brand.
- An authenticated personal may customize the app name, action color, navigation/footer color and logo shown to their linked students.
- White-label choices must preserve readable contrast and may not replace semantic success, information, warning or error colors.
- The current React logo and generic dumbbell are not brand authority and must be replaced.
- The product should feel like precise, encouraging coaching rather than a generic administrative dashboard.

## Evidence on Hand

- The repository contains working trainer and student flows and the real API field vocabulary.
- No approved logo, formal brand guide, testimonials or commercial claims exist; none should be invented.

## Product Principles

- Make the next action obvious during a workout.
- Keep management dense on desktop and comfortably touchable on mobile.
- Show honest loading, empty, error and offline states instead of dead controls.
- Preserve familiar platform behavior and make every primary action keyboard and touch accessible.

## Accessibility & Inclusion

- Target WCAG 2.2 AA across the primary trainer and student flows.
- Support keyboard navigation, visible focus, 200% zoom, reduced motion, screen-reader names and touch targets of at least 44 by 44 CSS pixels.
