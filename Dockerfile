FROM public.ecr.aws/lambda/nodejs:18

ARG TURBO_PROJECT

COPY app.js entry.js . /var/task/

ADD https://turbo360.s3.amazonaws.com/projects/${TURBO_PROJECT}/container/package.json /var/task/package.json

RUN npm install --production

CMD [ "entry.handler" ]