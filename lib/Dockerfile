FROM centos:centos7

RUN curl -sL https://rpm.nodesource.com/setup | bash -
RUN yum install -y nodejs
RUN yum groupinstall -y 'Development Tools'

# copy source files
COPY . /src

# run npm install
RUN cd /src; npm install

ENV PORT=8080

EXPOSE 8080

CMD ["node", "/src/app.js"]