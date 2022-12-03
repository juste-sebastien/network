import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, csrf_protect

from .models import User, Post, Relationship

from .util import generate_profile_img as generate
from .util import is_in_relation


def index(request):
    return render(request, "network/index.html", {
        "posts": Post.objects.order_by("-timestamp").all(),
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })
        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def new_post(request):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # 
    data = json.loads(request.body)
    content = data["content"]
    if content == "":
        return JsonResponse({
            "error": "Post must not be empty."
        }, status=400)
    user = User.objects.get(username=request.user)
    user.total_posts += 1
    user.save()
    timestamp = timezone.now()
    like = 0

    post = Post.objects.create(user=user, content=content, timestamp=timestamp, like=like)
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)


def all_posts(request):
    posts = Post.objects.order_by("-timestamp").all().values()

    for post in posts:
        post_user = User.objects.get(id=post["user_id"])
        post["username"] = post_user.username
        post["user_profile_img"] = post_user.img_profile.path
    return JsonResponse([post for post in posts], safe=False)


def profile_page(request, username):
    user_profile = User.objects.get(username=username)
    # Check if request user is registered
    try:
        current_user = User.objects.get(username=request.user)
    except User.DoesNotExist as error:
        user_profile.statement = False
    else:
        if is_in_relation(current_user, user_profile):
            user_profile.statement = False
        else:
            user_profile.statement = True
        user_profile.save()

    users = []
    for user in User.objects.all().values():
        user["is_authenticated"] = True if current_user.is_authenticated else False
        user["request_user"] = True if current_user.id == user_profile.id else False
        print(user)
        users.append(user)

    return JsonResponse(users, safe=False)
