# Demo Kuma

Create a demo site for your Docker based web application.

Live Demo (Uptime Kuma):
https://demo.kuma.pet/start-demo

ExerciseDiary (2 mins demo) - Another demo which I found on Reddit:
https://exercisediary-demo.kuma.pet/start-demo



## Features

- Quickly create a demo for your project.
- Spin up a docker stack when requested, shut down the stack when it is time up.
- A countdown timer at the bottom right corner.
- Custom demo duration.
- Portless demo instances design in v2, you just need one port for Demo Kuma.

## How to use

1. mkdir `demo-kuma`
1. Download `compose.yaml` and `compose-demo.yaml` into the directory
1. `docker compose up -d`
1. Go to http://localhost:3003/start-demo

## How it works?

1. Demo Kuma takes control of your Docker
1. User requests a demo via a browser
1. Demo Kuma assign a session ID for this request and spin up the stack `compose-demo.yaml`
1. Once the demo stack is started, Demo Kuma will act as a reverse proxy to communicate between the browser and the demo stack.
1. The timer will be created at the same time. When time up, Demo Kuma will shut down the stack.
