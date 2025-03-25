import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

console.log(matchers);

export default clerkMiddleware((auth, req) => {
  // if (isProtectedRoute(req)) auth().protect()

  const { sessionClaims } = auth();

  const role = (sessionClaims?.metadata as { role?: string })?.role;

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(role!)) {
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { routeAccessMap } from "./lib/settings";
// import { NextResponse } from "next/server";

// const matchers = Object.keys(routeAccessMap).map((route) => ({
//   matcher: createRouteMatcher([route]),
//   allowedRoles: routeAccessMap[route],
// }));

// const publicRoutes = ['/sign-in', '/sign-up', '/'];

// export default clerkMiddleware((auth, req) => {
//   // Skip middleware for public routes
//   if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
//     return NextResponse.next();
//   }

//   const { sessionClaims, userId } = auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   // If not signed in, redirect to sign-in
//   if (!userId) {
//     return NextResponse.redirect(new URL('/sign-in', req.url));
//   }

//   // If signed in but role not loaded yet, wait
//   if (userId && !role) {
//     return NextResponse.next();
//   }

//   // Check route access
//   for (const { matcher, allowedRoles } of matchers) {
//     if (matcher(req) && !allowedRoles.includes(role!)) {
//       return NextResponse.redirect(new URL(`/${role}`, req.url));
//     }
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };