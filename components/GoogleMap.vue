<template>
  <div ref="mapContainer" style="width: 100%; height: 500px;"></div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  props: {
    markers: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const mapContainer = ref(null);
    let map;

    const getLocationName = (lat, lng) => {
      return new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              resolve(results[0].formatted_address); 
            } else {
              resolve("No results found");
            }
          } else {
            reject(`Geocoder failed due to: ${status}`);
          }
        });
      });
    };

    const initializeMap = async () => {
      map = new google.maps.Map(mapContainer.value, {
        center: { lat: 21.4225, lng: 39.8262 }, 
        zoom: 12,
      });

  
      for (const marker of props.markers) {
        try {
          const locationName = await getLocationName(marker.lat, marker.lng);
          
          const infoWindow = new google.maps.InfoWindow({
            content: locationName, 
          });

          const googleMarker = new google.maps.Marker({
            position: marker,
            map: map,
          });

          // Show location name on hover
          googleMarker.addListener('mouseover', () => {
            infoWindow.open(map, googleMarker);
          });

          googleMarker.addListener('mouseout', () => {
            infoWindow.close();
          });
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.initGoogleMaps = initializeMap;

    onMounted(() => {
      if (window.google && window.google.maps) {
        initializeMap();
      }
    });

    return {
      mapContainer,
    };
  },
};
</script>
<style>
.gm-ui-hover-effect{
  display: none !important;
}
</style>
