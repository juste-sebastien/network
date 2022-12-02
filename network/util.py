from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from PIL import Image

from random import randint


def generate_profile_img(username):
    im = Image.new('RGB', (100,100))
    pixel = im.load()

    rand_color = randint(0,220)
    white = 255
    colors = [rand_color, white]

    for x in range(im.size[0]):
        for y in range(im.size[1]):
            current_color = colors[randint(0,1)]
            if (x != 0 and y != 0) or (x != 100 and y != 100):
                pixel[x, y] == (current_color, current_color, current_color)

    im.save(f"/static/network/profile_img/{username}.png")
    save_image(username, im)


def save_image(name, content):
    """
    Saves a user's profile imageIf an existing entry with the same title already exists,
    it is replaced.
    """
    filename = f"/static/network/profile_img/{name}.png"
    if default_storage.exists(filename):
        default_storage.delete(filename)
    default_storage.save(filename, ContentFile(content))