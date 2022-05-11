const style = `
.activity-list li:after, .fa, .fas {
    font-family: "Font Awesome 5 Pro" !important;
}
.action-buy:after {
    content: "\f07a" !important;
}

.action-on-auction:after {
    content: "\f3c5" !important;
}

.action-down-auction:after {
    content: "\f605" !important;
}

.action-to-normal:after {
    content: "\f603" !important;
}

.action-to-premium:after {
    content: "\f601" !important;
}

.action-like:after {
    content: "\f004" !important;
}

.action-dislike:after {
    content: "\f7a9" !important;
}

.action-claim:after {
    content: "\f560" !important;
}

.action-sell:after {
    content: "\f54e" !important;
}

.action-down-sell:after {
    content: "\\e071" !important;
}

.action-make-bid:after {
    content: "\f658" !important;
}

.action-withdraw-bid:after {
    content: "\f2b6" !important;
}

.action-follow:after {
    content: "\f563" !important;
}

.action-disfollow:after {
    content: "\f564" !important;
}

.active i {
    color: white !important;
}

.mx-150px {
    max-width: 150px;
}

.w-100px {
    width: 100px !important;
}

.loading-item {
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    position: relative;
    padding-right: 100px;
    background: rgba(255, 255, 255, 0.025);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0px 0px 8px 0px rgb(0 0 0 / 30%);
}`;

export default style;