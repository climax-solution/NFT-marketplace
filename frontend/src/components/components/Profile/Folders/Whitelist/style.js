const style = `
.container {
    max-width: 1170px;
}
.list-box {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 20px;
    max-width: 500px;
    width: 100%;
    .list {
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        min-height: 300px;
        max-height: 300px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        grid-gap: 10px;
        ::-webkit-scrollbar {
            width: 10px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1; 
        }
        ::-webkit-scrollbar-thumb {
            background: #888; 
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555; 
        }
    }
}
.manage-content {
    max-width: 1170px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
}

.folder-name {
    text-shadow: 2px 2px 0 #4074b5, 2px -2px 0 #4074b5, -2px 2px 0 #4074b5, -2px -2px 0 #4074b5, 2px 0px 0 #4074b5, 0px 2px 0 #4074b5, -2px 0px 0 #4074b5, 0px -2px 0 #4074b5;
    font-size: 26px;
}`;

export default style;