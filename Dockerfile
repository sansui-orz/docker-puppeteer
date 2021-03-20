FROM node:14.16.0-buster-slim@sha256:ffc15488e56d99dbc9b90d496aaf47901c6a940c077bc542f675ae351e769a12
ARG APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1
RUN apt-get update
RUN apt-get install -y wget gnupg ca-certificates procps libxss1 --fix-missing
RUN wget -q -O - http://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable
RUN rm -rf /var/lib/apt/lists/*
# RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh
COPY ./wait-for-it.sh /usr/sbin/wait-for-it.sh
RUN chmod +x /usr/sbin/wait-for-it.sh

COPY . /app
WORKDIR /app

RUN npm install

RUN npm install puppeteer

EXPOSE 3000

CMD node index.js