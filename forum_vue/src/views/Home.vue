<template>
  <div class="home">
    <div class="d-flex flex-wrap ">
      <v-hover
        v-for="item of sectionsInfo"
        :key="item.id"
        class="px-2 py-2"
        style="width: 50%"
        v-slot:default="{ hover }"
      >
        <div class="pa-1">
          <v-card
            :elevation="hover ? 12 : 2"
            class="text-center py-3"
            v-ripple
            @click="goToSection(item.id)"
            >{{ item.name }}</v-card
          >
        </div>
      </v-hover>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  components: {},
  data: () => {
    return {
      sectionsInfo: []
    };
  },
  methods: {
    goToSection(id) {
      this.$router.push("/section/" + id);
    }
  },
  mounted() {
    let $this = this;
    $this.$axios.get("/api/getSections").then(function(response) {
      for (let section of response.data.data) {
        $this.sectionsInfo.push(section);
      }
    });
  }
};
</script>
