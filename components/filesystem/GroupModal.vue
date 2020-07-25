<template>
  <b-modal id="group-setting-modal" ref="groupSetting" hide-footer :title="group.name">
    <b-tabs>
      <b-tab v-if="userId === group.ownerId" title="Group Management">
        <div class="tabs-content">
          <b-table
            :fields="fields"
            :items="group.members"
            foot-clone
          >
            <template v-slot:cell(action)="data">
              <b-button>
                <font-awesome-icon
                  class="icon my-icon"
                  :icon="['fas', 'user-minus']"
                  @click="revokeGroupAccess(data.item.id)"
                />
              </b-button>
            </template>
            <template v-slot:foot(name)>
              <b-form-input
                v-model="form"
                placeholder="newmember@domain.org"
              />
            </template>
            <template v-slot:foot(action)>
              <b-button>
                <font-awesome-icon
                  class="icon my-icon"
                  :icon="['fas', 'user-plus']"
                  @click="grantGroupAccess(form)"
                />
              </b-button>
            </template>
          </b-table>
        </div>
      </b-tab>
      <b-tab title="Options">
        <div class="tabs-content">
          <div class="submit-wrapper">
            <b-button class="submit-button" @click="quitGroup">
              Quit
            </b-button>
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </b-modal>
</template>

<script>
import groupManipulation from '~/mixin/groupManipulation'

export default {
  name: 'GroupModal',
  mixins: [groupManipulation],
  props: {
    group: {
      type: Object,
      default () {
        return {
          name: '',
          id: '',
          members: [],
          ownerId: ''
        }
      }
    }
  },
  data () {
    return {
      fields: [{
        key: 'name',
        label: 'Name'
      },
      {
        key: 'action',
        label: 'Remove'
      }],
      form: ''
    }
  },
  computed: {
    userId () { return this.$store.state.home.userId }
  },
  methods: {
    showModal () {
      this.$refs.groupSetting.show()
    },

    revokeGroupAccess (targetUserId) {
      this.removeMember(targetUserId)
    },

    grantGroupAccess (targetUserEmail) {
      this.addMember(targetUserEmail)
    },
    quitGroup () {
      this.$refs.groupSetting.hide()
      this.leftGroup(this.group.id)
    }
  }
}
</script>

<style scoped>
  .tabs-content {
    margin-top: 5%;
  }

  .submit-button {
    align-self: center;
    border-color: orange;
    color: orange;
    border-style: solid;
    border-width: 1px;
  }

  .submit-wrapper {
    margin-top: 5%;
    display: flex;
    justify-content: center;
  }
</style>
