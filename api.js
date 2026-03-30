// API 基础配置
const API_BASE_URL = 'http://localhost:8080/api'; // 后端API地址，根据你的后端端口修改

// 本地存储键名
const STORAGE_KEYS = {
    TOKEN: 'studyPlanner_token',
    USER: 'studyPlanner_user'
};

// ==================== 工具函数 ====================

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: success, error, info
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        // 如果页面没有toast元素，创建一个
        const newToast = document.createElement('div');
        newToast.id = 'toast';
        newToast.className = 'toast';
        newToast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s;
            color: white;
            font-size: 14px;
        `;
        document.body.appendChild(newToast);
    }
    
    const toastEl = document.getElementById('toast');
    toastEl.textContent = message;
    
    // 根据类型设置背景色
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#6366f1'
    };
    toastEl.style.backgroundColor = colors[type] || colors.info;
    
    toastEl.classList.add('show');
    toastEl.style.opacity = '1';
    
    setTimeout(() => {
        toastEl.classList.remove('show');
        toastEl.style.opacity = '0';
    }, 3000);
}

/**
 * 发送HTTP请求
 * @param {string} url - 请求地址
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @returns {Promise} - 返回Promise对象
 */
async function request(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // 添加token到请求头
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error.message || '网络错误，请稍后重试';
    }
}

// ==================== 认证相关API ====================

const authApi = {
    /**
     * 用户注册
     * @param {object} userData - 用户数据
     * @returns {Promise}
     */
    async register(userData) {
        try {
            const result = await request('/auth/register', 'POST', userData);
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * 用户登录
     * @param {object} credentials - 登录凭证
     * @returns {Promise}
     */
    async login(credentials) {
        try {
            // 模拟登录（在没有后端时使用）
            // 实际项目中应该调用真实的后端API
            // const result = await request('/auth/login', 'POST', credentials);
            
            // 模拟登录验证
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // 模拟验证 - 实际项目中应该由后端验证
                    const users = JSON.parse(localStorage.getItem('studyPlanner_users') || '[]');
                    const user = users.find(u => u.email === credentials.email);
                    
                    if (!user) {
                        reject('用户不存在');
                        return;
                    }
                    
                    if (user.password !== credentials.password) {
                        reject('密码错误');
                        return;
                    }
                    
                    // 生成模拟token
                    const token = 'mock_token_' + Date.now();
                    
                    // 保存登录状态
                    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }));
                    
                    resolve({
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email
                        }
                    });
                }, 500); // 模拟网络延迟
            });
            
            // 真实后端API调用（取消上面的模拟代码，使用下面的代码）
            // const result = await request('/auth/login', 'POST', credentials);
            // if (result.token) {
            //     localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
            //     localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
            // }
            // return result;
        } catch (error) {
            throw error;
        }
    },
    
    /**
     * 用户登出
     */
    logout() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '登录.txt';
    },
    
    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
    },
    
    /**
     * 获取当前用户信息
     * @returns {object|null}
     */
    getCurrentUser() {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    }
};

// ==================== 本地存储的用户管理（模拟后端）====================

const localUserApi = {
    /**
     * 注册用户到本地存储
     * @param {object} userData - 用户数据
     */
    register(userData) {
        const users = JSON.parse(localStorage.getItem('studyPlanner_users') || '[]');
        
        // 检查邮箱是否已存在
        if (users.some(u => u.email === userData.email)) {
            throw new Error('该邮箱已被注册');
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // 实际项目中应该加密存储
            phone: userData.phone || null,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('studyPlanner_users', JSON.stringify(users));
        
        return { success: true, message: '注册成功' };
    }
};

// ==================== 课程相关API ====================

const courseApi = {
    /**
     * 获取所有课程
     * @returns {Promise}
     */
    async getAll() {
        // 从本地存储获取
        const courses = JSON.parse(localStorage.getItem('studyPlanner_courses') || '[]');
        return courses;
    },
    
    /**
     * 添加课程
     * @param {object} courseData - 课程数据
     * @returns {Promise}
     */
    async add(courseData) {
        const courses = JSON.parse(localStorage.getItem('studyPlanner_courses') || '[]');
        const newCourse = {
            id: Date.now(),
            ...courseData,
            createdAt: new Date().toISOString()
        };
        courses.push(newCourse);
        localStorage.setItem('studyPlanner_courses', JSON.stringify(courses));
        return newCourse;
    },
    
    /**
     * 更新课程
     * @param {number} id - 课程ID
     * @param {object} courseData - 课程数据
     * @returns {Promise}
     */
    async update(id, courseData) {
        const courses = JSON.parse(localStorage.getItem('studyPlanner_courses') || '[]');
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...courseData };
            localStorage.setItem('studyPlanner_courses', JSON.stringify(courses));
            return courses[index];
        }
        throw new Error('课程不存在');
    },
    
    /**
     * 删除课程
     * @param {number} id - 课程ID
     * @returns {Promise}
     */
    async delete(id) {
        let courses = JSON.parse(localStorage.getItem('studyPlanner_courses') || '[]');
        courses = courses.filter(c => c.id !== id);
        localStorage.setItem('studyPlanner_courses', JSON.stringify(courses));
        return { success: true };
    }
};

// ==================== 任务相关API ====================

const taskApi = {
    /**
     * 获取所有任务
     * @returns {Promise}
     */
    async getAll() {
        const tasks = JSON.parse(localStorage.getItem('studyPlanner_tasks') || '[]');
        return tasks;
    },
    
    /**
     * 添加任务
     * @param {object} taskData - 任务数据
     * @returns {Promise}
     */
    async add(taskData) {
        const tasks = JSON.parse(localStorage.getItem('studyPlanner_tasks') || '[]');
        const newTask = {
            id: Date.now(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        localStorage.setItem('studyPlanner_tasks', JSON.stringify(tasks));
        return newTask;
    },
    
    /**
     * 更新任务
     * @param {number} id - 任务ID
     * @param {object} taskData - 任务数据
     * @returns {Promise}
     */
    async update(id, taskData) {
        const tasks = JSON.parse(localStorage.getItem('studyPlanner_tasks') || '[]');
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
            localStorage.setItem('studyPlanner_tasks', JSON.stringify(tasks));
            return tasks[index];
        }
        throw new Error('任务不存在');
    },
    
    /**
     * 删除任务
     * @param {number} id - 任务ID
     * @returns {Promise}
     */
    async delete(id) {
        let tasks = JSON.parse(localStorage.getItem('studyPlanner_tasks') || '[]');
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('studyPlanner_tasks', JSON.stringify(tasks));
        return { success: true };
    },
    
    /**
     * 切换任务完成状态
     * @param {number} id - 任务ID
     * @returns {Promise}
     */
    async toggleComplete(id) {
        const tasks = JSON.parse(localStorage.getItem('studyPlanner_tasks') || '[]');
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index].completed = !tasks[index].completed;
            localStorage.setItem('studyPlanner_tasks', JSON.stringify(tasks));
            return tasks[index];
        }
        throw new Error('任务不存在');
    }
};

// ==================== 目标相关API ====================

const goalApi = {
    /**
     * 获取所有目标
     * @returns {Promise}
     */
    async getAll() {
        const goals = JSON.parse(localStorage.getItem('studyPlanner_goals') || '[]');
        return goals;
    },
    
    /**
     * 添加目标
     * @param {object} goalData - 目标数据
     * @returns {Promise}
     */
    async add(goalData) {
        const goals = JSON.parse(localStorage.getItem('studyPlanner_goals') || '[]');
        const newGoal = {
            id: Date.now(),
            ...goalData,
            current: 0,
            createdAt: new Date().toISOString()
        };
        goals.push(newGoal);
        localStorage.setItem('studyPlanner_goals', JSON.stringify(goals));
        return newGoal;
    },
    
    /**
     * 更新目标
     * @param {number} id - 目标ID
     * @param {object} goalData - 目标数据
     * @returns {Promise}
     */
    async update(id, goalData) {
        const goals = JSON.parse(localStorage.getItem('studyPlanner_goals') || '[]');
        const index = goals.findIndex(g => g.id === id);
        if (index !== -1) {
            goals[index] = { ...goals[index], ...goalData };
            localStorage.setItem('studyPlanner_goals', JSON.stringify(goals));
            return goals[index];
        }
        throw new Error('目标不存在');
    },
    
    /**
     * 更新目标进度
     * @param {number} id - 目标ID
     * @param {number} amount - 增加的进度
     * @returns {Promise}
     */
    async updateProgress(id, amount) {
        const goals = JSON.parse(localStorage.getItem('studyPlanner_goals') || '[]');
        const index = goals.findIndex(g => g.id === id);
        if (index !== -1) {
            goals[index].current = Math.max(0, Math.min(
                goals[index].current + amount,
                goals[index].target
            ));
            localStorage.setItem('studyPlanner_goals', JSON.stringify(goals));
            return goals[index];
        }
        throw new Error('目标不存在');
    },
    
    /**
     * 删除目标
     * @param {number} id - 目标ID
     * @returns {Promise}
     */
    async delete(id) {
        let goals = JSON.parse(localStorage.getItem('studyPlanner_goals') || '[]');
        goals = goals.filter(g => g.id !== id);
        localStorage.setItem('studyPlanner_goals', JSON.stringify(goals));
        return { success: true };
    }
};

// ==================== 专注时间API ====================

const focusApi = {
    /**
     * 获取专注时间统计
     * @returns {object}
     */
    getStats() {
        const stats = JSON.parse(localStorage.getItem('studyPlanner_focusStats') || '{}');
        return {
            totalTime: stats.totalTime || 0,
            totalSessions: stats.totalSessions || 0,
            todayTime: stats.todayTime || 0,
            lastFocusDate: stats.lastFocusDate || null
        };
    },
    
    /**
     * 记录专注时间
     * @param {number} minutes - 专注分钟数
     */
    recordFocus(minutes) {
        const today = new Date().toISOString().split('T')[0];
        let stats = JSON.parse(localStorage.getItem('studyPlanner_focusStats') || '{}');
        
        // 初始化
        if (!stats.totalTime) stats.totalTime = 0;
        if (!stats.totalSessions) stats.totalSessions = 0;
        if (!stats.todayTime) stats.todayTime = 0;
        if (!stats.lastFocusDate) stats.lastFocusDate = today;
        
        // 如果是新的一天，重置今日时间
        if (stats.lastFocusDate !== today) {
            stats.todayTime = 0;
            stats.lastFocusDate = today;
        }
        
        // 更新统计
        stats.totalTime += minutes;
        stats.totalSessions += 1;
        stats.todayTime += minutes;
        
        localStorage.setItem('studyPlanner_focusStats', JSON.stringify(stats));
        return stats;
    }
};

// ==================== 页面权限控制 ====================

/**
 * 检查登录状态，未登录则跳转到登录页
 */
function requireAuth() {
    if (!authApi.isLoggedIn()) {
        window.location.href = '登录.html';
        return false;
    }
    return true;
}

/**
 * 检查登录状态，已登录则跳转到主页
 */
function redirectIfLoggedIn() {
    if (authApi.isLoggedIn()) {
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

// 导出API
export {
    authApi,
    localUserApi,
    courseApi,
    taskApi,
    goalApi,
    focusApi,
    showToast,
    request,
    requireAuth,
    redirectIfLoggedIn,
    STORAGE_KEYS
};

// 兼容非模块脚本的全局暴露
if (typeof window !== 'undefined') {
    window.authApi = authApi;
    window.localUserApi = localUserApi;
    window.courseApi = courseApi;
    window.taskApi = taskApi;
    window.goalApi = goalApi;
    window.focusApi = focusApi;
    window.showToast = showToast;
    window.requireAuth = requireAuth;
    window.redirectIfLoggedIn = redirectIfLoggedIn;
}
