import npm from '../../npm/index.js';

const app = getApp();

Page({
    data: {
        motto: 'wxSeed',
        userInfo: {},
    },
    onLoad() {
        console.log('npm:', npm);

        app.getUserInfo((userInfo) => {
            // 更新数据
            this.setData({
                userInfo,
            });
        });
    },
});