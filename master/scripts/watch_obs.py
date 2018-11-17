"""
Watch a stream of observations.
"""

import argparse

from gym.envs.classic_control.rendering import SimpleImageViewer
import numpy as np
import redis


def main():
    args = arg_parser().parse_args()

    conn = redis.StrictRedis(host=args.redis_host, port=args.redis_port)
    pubsub = conn.pubsub()
    pubsub.subscribe(args.channel + ':state:' + args.env_id)
    viewer = SimpleImageViewer()
    for msg in pubsub.listen():
        if msg['type'] != 'message':
            continue
        img = np.frombuffer(msg['data'][:3 * (args.obs_size ** 2)], dtype='uint8')
        img = img.reshape([args.obs_size] * 2 + [3])
        viewer.imshow(img)


def arg_parser():
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--redis-host', help='Redis host', default='qwop-redis')
    parser.add_argument('--redis-port', help='Redis port', default=6379, type=int)
    parser.add_argument('--channel', help='channel prefix', default='qwop-worker')
    parser.add_argument('--obs-size', help='size of observation images', default=84, type=int)
    parser.add_argument('env_id', help='environment ID')
    return parser


if __name__ == '__main__':
    main()
