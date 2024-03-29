const style = `
.ml-12 {
    margin-left: 12px;
}
.avatar-change {
    height: 100%;
    position: absolute;
    background: rgba(0,0,0,0.4);
    min-width: 150px;
    z-index: 999;
    border-radius: 50%;
    transition: 0.2s ease;
}

.profile_avatar {
    min-width: 350px;
    min-height: 150px;
}

.index-avatar {
    backface-visibility: hidden;
    aspect-ratio: 1;
}

.edit-btn {
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    cursor: pointer;
}

.user-info {
    border: 1px solid #333;
    border-radius: 5px;
}

.trade-btn-group span {
    padding: 2px 10px;
}

.mn-h-300px {
    min-height: 300px;
}

.overflow-unset {
    overflow: unset !important;
}`;

export default style;