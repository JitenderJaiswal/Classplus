import java.util.*;
public class Main{
   public static void dfs(int edges[][],int currV,boolean visited[],int[] hotspots,int distance,HashMap<Integer,Integer> map){
       visited[currV]=true;
       if(distance>=0){
         if(!map.containsKey(currV+1))
          map.put(currV+1,1); 
         else
          map.put(currV+1,map.get(currV+1)+1);
       }
       
       for(int i=0;i<edges.length;i++){
        if(edges[currV][i]==1 && visited[i]==false)
          dfs(edges,i,visited,hotspots,distance-1,map);
       }
   }
    public static int dfs(int edges[][],int[] hotspots,int distance){
      boolean visited[]=new boolean[edges.length];
      HashMap<Integer,Integer> map=new HashMap<>();
      int NUM_EPICENTRE=0;
      
      for(int i=0;i<hotspots.length;i++){
      dfs(edges,hotspots[i]-1,visited,hotspots,distance,map);
      Arrays.fill(visited, false);
      }
      
      for(int i=1;i<=edges.length;i++){
        if(map.get(i)>=hotspots.length)
           NUM_EPICENTRE++;
      }
     return NUM_EPICENTRE;
    }
	public static void main(String[] args) {
	    Scanner s=new Scanner(System.in);
         int NUM_CITIES=s.nextInt();
         int NUM_HOTSPOTS=s.nextInt();
         int distance=s.nextInt();
         int edges[][]=new int[NUM_CITIES][NUM_CITIES];
         int hotspots[]=new int[NUM_HOTSPOTS];
         
         for(int i=0;i<NUM_HOTSPOTS;i++){
             hotspots[i]=s.nextInt();  
         }
         
         for(int i=0;i<NUM_CITIES-1;i++){
          int v1=s.nextInt();
          int v2=s.nextInt();
          edges[v1-1][v2-1]=1;
          edges[v2-1][v1-1]=1;
        } 
        int NUM_EPICENTRE=dfs(edges,hotspots,distance);
        System.out.println("NUM OF EPICENTRES: "+NUM_EPICENTRE);
	}
}



