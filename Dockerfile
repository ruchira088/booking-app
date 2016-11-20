FROM node
MAINTAINER Ruchira Jayasekara <ruchira088@gmail.com>

ADD . /code
WORKDIR /code
RUN npm install

EXPOSE 8010
CMD ["start"]

ENTRYPOINT ["npm"]