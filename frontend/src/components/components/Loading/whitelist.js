const style = `
.whitelist-item {
    box-shadow: 0 1px 5px rgba(255, 255, 255, 0.3);
    padding: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    grid-gap: 20px;
    .user_info {
        display: flex;
        grid-gap: 10px;
        align-items: center;
        .avatar {
            width: 60px;
            height: 60px;
        }
        user_info .name-group .name .user-name {
            width: 80px;
        }
    }
    .button {
        width: 80px;
        height: 30px;
    }
}
`;

export default style;