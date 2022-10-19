#image
FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/email-blast
WORKDIR /usr/src/email-blast

# Install app dependencies
COPY package.json /usr/src/email-blast/
RUN npm install

# Bundle app source
COPY . /usr/src/email-blast/

