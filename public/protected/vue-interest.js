

const interestBox = document.querySelector('.interestSelect')
for (const box of interestBox) {
    box.addEventListener("change", async (evt,value) => {
    const res = await fetch(`/interestSelect/${evt.target.value}`,{
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedInfo)
    })
    const boxSelection = await res.json()
    console.log(boxSelection)   //get the user Result as a json
    app.boxSelection = boxSelection; // for Vue
 
    })
}
const app = new Vue({
    el: "#interestSelect",

    template:` 
    <select v-model="selected">
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    
    <input name='chatroom-interest' :value='Music'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Music= $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Music</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Coding'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Coding = $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Coding</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Cooking'
        class="form-checkbox-field" type="checkbox"
        :checked="booleanValue"
        v-on:input="Cooking = $event.target.value" />
    <i class="form-checkbox-button"></i>
    <span>Cooking</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Books'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Books = $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Books</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Dancing'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Dancing = $event.target.value" />
    <i class="form-checkbox-button"></i>
    <span>Dancing</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Movies'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Movies = $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Movies</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Fine_Art'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Fine_Art = $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Fine Art</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Writing'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Writing= $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Writing</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Yoga'
        class="form-checkbox-field" type="checkbox" 
        :checked="booleanValue"
        v-on:input="Yoga= $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Yoga</span>
    </label>
    
    <label class="form-checkbox-label" v-for="choices in interestChoice">
    <input name='chatroom-interest' :value='Sports'
        class="form-checkbox-field" type="checkbox"
        :checked="booleanValue"
        v-on:input="Sports = $event.target.value"/>
    <i class="form-checkbox-button"></i>
    <span>Sports</span>
    </label>
    </select>
    `,
    data() {
      return {
        checkedNames: {}
      }
    }
})
    
