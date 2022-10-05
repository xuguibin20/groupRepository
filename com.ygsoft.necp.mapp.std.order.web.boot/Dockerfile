FROM 10.51.151.1:5000/ygopenjdk:8-jre-alpine
LABEL MAINTAINER="DevCloud <04192213>"

ADD target/necp.order.web.boot-1.1.0-SNAPSHOT.jar /app/necp.order.web.boot-1.1.0-SNAPSHOT.jar

EXPOSE 9999

CMD ["java","-jar","/app/necp.order.web.boot-1.1.0-SNAPSHOT.jar"]