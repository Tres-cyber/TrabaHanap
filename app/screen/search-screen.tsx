
import React, { useState, useCallback, useEffect } from "react";

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,

  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { searchJobSeekers } from "../../api/search-request";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface JobSeeker {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImage?: string;
  category?: string;
  rating?: number;
}

interface SearchResponse {
  data: JobSeeker[];
  pagination: { [key: string]: any };

}

const SearchScreen = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<JobSeeker[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string, filter: string) => {
      if (query.trim().length === 0 && filter === "all") {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        const options: { category?: string } = {};
        if (filter !== "all") {
          options.category = filter;
        }

        const results = (await searchJobSeekers(
          query,
          options
        )) as SearchResponse;
        setSearchResults(results.data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (text.trim().length > 0) {
      setIsLoading(true);
      // Always search "all" categories when typing in the search bar
      debouncedSearch(text, "all");
    } else {
      setSearchResults([]);
      // Optional: Reset loading state if needed when clearing input
      // setIsLoading(false);
    }
  };

  // Handle filter selection
  // const handleFilterSelect = (filterId: string) => {
  //   setSelectedFilter(filterId);
  //   if (searchQuery.trim().length > 0) {
  //     setIsLoading(true);
  //     debouncedSearch(searchQuery, filterId);
  //   }
  // };

  // Navigate to job seeker profile
  const handleJobSeekerSelect = (jobSeekerId: string) => {
    // Navigate to the specific job seeker view page
    router.push({
      pathname: "/screen/profile/view-profile/view-page-job-seeker" as any,
      params: { otherParticipantId: jobSeekerId }, // Pass ID as otherParticipantId
    });
  };


  const handleGoBack = () => {
    router.back();
  };


  const filters = [
    { id: "all", label: "All" },
    { id: "plumbing", label: "Plumbing" },
    { id: "electricalRepairs", label: "Electrical" },
    { id: "carpentry", label: "Carpentry" },
    { id: "homeCleaningServices", label: "Cleaning" },
    { id: "paintingServices", label: "Painting" },
  ];

  const renderSearchResult = ({ item }: { item: JobSeeker }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleJobSeekerSelect(item.id)}
    >
      <Image
        source={
          item.profileImage
            ? {
                uri: `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${item.profileImage}`,
              }
            : require("../../assets/images/default-user.png")
        }
        style={styles.resultImage}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>
          {item.firstName} {item.middleName} {item.lastName}
        </Text>
        <Text style={styles.resultCategory}>{item.category || "General"}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || "No ratings"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  const fetchTopCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.push('/sign_in');
        return;
      }

      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/jobs/top-categories`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      


      // Log the categories to debug
      console.log('Fetched categories:', data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchTopCategories();
  }, []);


  const handleFilterSelect = (filterId: string) => {
    console.log('Selected filter:', filterId); // Debug log
    setSelectedFilter(filterId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back-outline" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search job seekers by name, skill..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters - REMOVED */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContentContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipSelected,
            ]}
            onPress={() => handleFilterSelect(filter.id)}
          >
            <Text
              style={[

                styles.filterText,
                selectedFilter === filter.id && styles.filterTextSelected,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      {/* Conditional Rendering Logic */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B153C" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.searchResultsList}
        />
      ) : searchQuery.length > 0 || selectedFilter !== "all" ? (
        // Show "No results" if a search/filter was attempted but yielded nothing
        <View style={styles.emptyResultsContainer}>
          <Text style={styles.emptyResultsText}>No job seekers found</Text>
        </View>
      ) : (
        // Show initial content (Popular Categories) only when no search/filter is active and no results
        <ScrollView style={styles.content}>
          {/* Popular Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.categoriesGrid}>
              {filters.slice(1).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => {
                    setSelectedFilter(category.id); // Set the filter state
                    setSearchQuery(""); // Clear the main search query
                    setIsLoading(true);
                    // Directly trigger search with empty query but selected filter
                    debouncedSearch("", category.id);
                  }}
                >
                  <View style={styles.categoryIcon}>
                    <MaterialIcons name="work" size={24} color="#0B153C" />
                  </View>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  content: {
    flex: 1,
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  resultInfo: {
    marginLeft: 16,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  resultCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyResultsContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyResultsText: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 12,
  },
  categoryCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",

    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  categoryLabel: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",

  },
  timePosted: {
    fontSize: 12,
    color: '#999',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  filterCount: {
    fontSize: 12,
    color: '#666',
  },
  filterCountSelected: {
    color: '#fff',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SearchScreen;
