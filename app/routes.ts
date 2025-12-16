// app/routes.ts
import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
    route('/api/jobs', 'routes/api.jobs.ts'),
    
    // NEW ROUTES
    route('/compass', 'routes/compass.tsx'), // For 1st year students
    route('/builder', 'routes/builder.tsx'), // For building from scratch
   
    
] satisfies RouteConfig;