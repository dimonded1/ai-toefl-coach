FROM nginx:alpine

ENV BACKEND_ORIGIN=https://ai-toefl-backend.onrender.com
ENV BACKEND_HOST=ai-toefl-backend.onrender.com

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
