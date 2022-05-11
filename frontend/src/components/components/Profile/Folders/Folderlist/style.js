const style = `
.btn-group-overlay {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    opacity: 0;
    transition: 0.5s ease;
    display: flex;
    flex-direction: column;
    grid-gap: 10px;
    justify-content: center;
    align-items: center;
    button {
        width: 200px;
    }
    .btn:before {
        background-image: none !important;
    }
}

.folder-item:hover .btn-group-overlay {
    opacity: 1;
}`;

export default style;