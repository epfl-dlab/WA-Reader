FROM python:3.9.1-alpine3.13

RUN mkdir /workdir
ADD . /workdir

WORKDIR /workdir
RUN pip3 install -U pip
RUN pip3 install -r requirements.txt

CMD gunicorn app:app -b 0.0.0.0:80 --log-level debug

