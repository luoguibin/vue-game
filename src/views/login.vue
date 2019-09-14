<template>
  <el-dialog
    :title="signUpValue ? '注册' : '登录'"
    :visible.sync="visible"
    :close-on-click-modal="false"
  >
    <el-form ref="ruleForm" :model="account" :rules="formRules" label-width="80px">
      <el-form-item label="账 号" prop="uId">
        <el-input v-model.number="account.uId" type="tel"></el-input>
      </el-form-item>
      <el-form-item label="昵 称" prop="name" v-if="signUpValue">
        <el-input v-model.trim="account.name"></el-input>
      </el-form-item>
      <el-form-item label="密 码" prop="pw">
        <el-input v-model="account.pw" show-password clearable></el-input>
      </el-form-item>
      <el-form-item label="重复密码" prop="pw2" v-if="signUpValue">
        <el-input v-model="account.pw2" show-password clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click.stop="onLoginCreate"
          :loading="inRequest"
        >{{signUpValue ? "注册" : "登录"}}</el-button>
        <el-switch
          style="float: right; margin-top: 20px;"
          v-model="signUpValue"
          @change="signUpChange"
          active-color="#13ce66"
          active-text="注册"
        ></el-switch>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { loginByAccount, createUser } from "@/api/index";

export default {
  name: "login",

  data() {
    return {
      visible: true,
      signUpValue: false,
      inRequest: false,
      account: {
        type: "game",
        uId: 15625045984,
        // name: "",
        pw: "123456"
        // pw2: "123456"
      },
      formRules: {
        uId: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: this.validateUId, trigger: "blur" }
        ],
        name: [
          { required: true, min: 1, message: "请输入昵称", trigger: "blur" }
        ],
        pw: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
        ],
        pw2: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度在 6 到 20 个字符",
            trigger: "blur"
          },
          { validator: this.validatePass2, trigger: "blur" }
        ]
      }
    };
  },

  mounted() {
    window.login = this;
  },

  methods: {
    validateUId(rule, value, callback) {
      if (!/^1[34578]\d{9}$/.test(value)) {
        callback(new Error("请输入11位手机号码"));
      } else {
        callback();
      }
    },

    validatePass2(rule, value, callback) {
      if (value !== this.account.pw) {
        callback(new Error("两次密码不一致"));
      } else {
        callback();
      }
    },

    signUpChange() {
      this.$refs.ruleForm.clearValidate();
      this.inRequest = false;
    },

    onLoginCreate() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.inRequest = true;
          if (this.signUpValue) {
            createUser(this.account)
              .then(resp => {
                if (resp.data.code === 1000) {
                  const userInfo = resp.data.data;
                  this.setUserInfo(userInfo);
                  this.$message("注册成功");
                  this.signUpValue = false;
                  this.visible = false;
                } else {
                  this.$message.error(resp.data.msg);
                }
              })
              .finally(() => {
                this.inRequest = false;
              });
          } else {
            loginByAccount(this.account)
              .then(resp => {
                if (resp.data.code === 1000) {
                  const userInfo = resp.data.data;
                  this.setUserInfo(userInfo);
                  this.visible = false;
                } else {
                  this.$message.error(resp.data.msg);
                }
              })
              .finally(() => {
                this.inRequest = false;
              });
          }
        } else {
          this.$message.warning("请输入表单内容");
        }
      });
    },

    ...mapActions({
      setUserInfo: "setUserInfo"
    })
  }
};
</script>

<style>
</style>
