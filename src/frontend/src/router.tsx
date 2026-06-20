import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'

import LoginPage from '@/pages/Login/LoginPage'
import AuthLayout from '@/components/AuthLayout/AuthLayout'
import DashboardPage from '@/pages/Dashboard/DashboardPage'
import GapPage from '@/pages/Gap/GapPage'
import RoadmapPage from '@/pages/Roadmap/RoadmapPage'
import ConfirmedRoadmapPage from '@/pages/Roadmap/ConfirmedRoadmapPage'
import AppointmentsPage from '@/pages/Appointments/AppointmentsPage'
import AppointmentRequestPage from '@/pages/Appointments/AppointmentRequestPage'
import ProposeTimePage from '@/pages/Appointments/ProposeTimePage'
import CounselorDashboardPage from '@/pages/CounselorDashboard/CounselorDashboardPage'
import CounselorAppointmentsPage from '@/pages/CounselorAppointments/CounselorAppointmentsPage'
import CounselorProposePage from '@/pages/CounselorAppointments/CounselorProposePage'
import NotFoundPage from '@/pages/NotFound/NotFoundPage'

// ─── Root ────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// ─── Index: redirect a /app/dashboard ────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard' })
  },
})

// ─── Login ───────────────────────────────────────────────────────────────
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// ─── App layout (employee) ───────────────────────────────────────────────
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AuthLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const gapRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/gap',
  component: GapPage,
})

const roadmapRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/roadmap',
  component: RoadmapPage,
})

const confirmedRoadmapRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/roadmap/confirmed',
  component: ConfirmedRoadmapPage,
})

const appointmentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/appointments',
  component: AppointmentsPage,
})

const appointmentNewRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/appointments/new',
  component: AppointmentRequestPage,
})

const appointmentProposeRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/appointments/propose',
  component: ProposeTimePage,
})

// ─── Counselor layout ────────────────────────────────────────────────────
const counselorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/counselor',
  component: AuthLayout,
})

const counselorDashboardRoute = createRoute({
  getParentRoute: () => counselorLayoutRoute,
  path: '/dashboard',
  component: CounselorDashboardPage,
})

const counselorAppointmentsRoute = createRoute({
  getParentRoute: () => counselorLayoutRoute,
  path: '/appointments',
  component: CounselorAppointmentsPage,
})

const counselorProposeRoute = createRoute({
  getParentRoute: () => counselorLayoutRoute,
  path: '/appointments/propose',
  component: CounselorProposePage,
})

// ─── 404 ─────────────────────────────────────────────────────────────────
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
})

// ─── Albero route ─────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appLayoutRoute.addChildren([
    dashboardRoute,
    gapRoute,
    roadmapRoute,
    confirmedRoadmapRoute,
    appointmentsRoute,
    appointmentNewRoute,
    appointmentProposeRoute,
  ]),
  counselorLayoutRoute.addChildren([
    counselorDashboardRoute,
    counselorAppointmentsRoute,
    counselorProposeRoute,
  ]),
  notFoundRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
