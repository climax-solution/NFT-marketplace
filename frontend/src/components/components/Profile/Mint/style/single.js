const style = `
.preview-video {
    object-fit: cover;
}

.nft-art {
    padding: 20px 0;
    border: solid 1px rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

.border-grey {
    border-color: #4e4e4e !important;
}

.w-300px {
    min-width: 300px !important;
    max-width: 300px !important;
}

.properties-group {
    display:  flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #333;
    border-top: 1px solid #333;
    padding: 10px 0;
}

.open-btn {
    padding: 15px 20px;
    border: 1px solid #333;
    border-radius: 6px;
}

.attr-list {
    max-height: 350px;
    overflow: auto;
}

.attr-item {
    display: flex;
    align-items: center;
    column-gap: 10px;
}`;

export default style;